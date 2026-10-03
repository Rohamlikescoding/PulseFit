import threading

from django.db import connection


def run_concurrently(*funcs):
    """
    Run each function in its own thread, released at the same moment by a barrier.
    Each thread gets its own DB connection (like two real requests).
    Returns [("ok", result) | ("error", exception), ...] in the same order.
    Use with @pytest.mark.django_db(transaction=True) so threads see committed data.
    """
    barrier = threading.Barrier(len(funcs))
    results = [None] * len(funcs)

    def worker(index, func):
        try:
            barrier.wait()
            results[index] = ("ok", func())
        except Exception as exc:  # noqa: BLE001 - reported to the test
            results[index] = ("error", exc)
        finally:
            connection.close()

    threads = [threading.Thread(target=worker, args=(i, f)) for i, f in enumerate(funcs)]
    for t in threads:
        t.start()
    for t in threads:
        t.join(timeout=30)
    return results
