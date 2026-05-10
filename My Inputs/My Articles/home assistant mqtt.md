---
Status: 🟧
tags: "input/articles"
Links: ["[[Home Assistant MOC]]"]
Created: 2024-09-03T13:27:04
Source: "https://www.home-assistant.io/integrations/mqtt/#discovery-topic"
Author:
Collection:
Finished:
Rating:
---
#### Discovery topic[](https://www.home-assistant.io/integrations/mqtt/#discovery-topic)

The discovery topic needs to follow a specific format:

```text
<discovery_prefix>/<component>/[<node_id>/]<object_id>/config
```

- `<discovery_prefix>`: The Discovery Prefix defaults to `homeassistant`. This prefix can be [changed](https://www.home-assistant.io/integrations/mqtt/#discovery-options).
- `<component>`: One of the supported MQTT integrations, eg. `binary_sensor`.
- `<node_id>` (_Optional_): ID of the node providing the topic, this is not used by Home Assistant but may be used to structure the MQTT topic. The ID of the node must only consist of characters from the character class `[a-zA-Z0-9_-]` (alphanumerics, underscore and hyphen).
- `<object_id>`: The ID of the device. This is only to allow for separate topics for each device and is not used for the `entity_id`. The ID of the device must only consist of characters from the character class `[a-zA-Z0-9_-]` (alphanumerics, underscore and hyphen).

The `<node_id>` level can be used by clients to only subscribe to their own (command) topics by using one wildcard topic like `<discovery_prefix>/+/<node_id>/+/set`.

Best practice for entities with a `unique_id` is to set `<object_id>` to `unique_id` and omit the `<node_id>`.