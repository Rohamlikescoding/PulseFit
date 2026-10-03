from rest_framework import serializers


class DemoSerializer(serializers.Serializer):
    name = serializers.CharField(
        required=True,
        max_length=50,
    )