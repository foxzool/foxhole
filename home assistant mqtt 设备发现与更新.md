---
Status: 
tags:
  - note/programming
Links:
  - "[[Home Assistant MOC]]"
Created: 2024-09-05T10:42:14
---
# 设备发现

当设备第一次上线时， 向mqtt发送设备定义数据，注意发送时，mqtt的retain要设为true

数据发送的topic格式为

```Plain
homeassistant/<component>/[<node_id>/]<object_id>/config
```

component为MQTT接口类型,比如说sensor,更多类型参考[文档](https://www.home-assistant.io/integrations/#search/mqtt)

node_id是可选项， 一般为mqtt用来聚合主题的，只能是字符、数字、连字符和下划线

object_id是一般就是home assistant里设备（device)ID,只能是字符、数字、连字符和下划线

# Sensor

[官方文档](https://www.home-assistant.io/integrations/sensor.mqtt/)

topic示例

dt/112/e/2

dt/senser/e_2/config

`homeassistant/sensor/112/901/config`

内容格式

```JSON
# 温度 homeassistant/sensor/112/901_senser1/config

{
   "name": "901 temperature s1",
   "device_class":"temperature",
   "state_topic":"homeassistant/sensor/112/901_senser/state",
   "unique_id":"senser901_1",
   "value_template":"{{ value_json.temperature}}",
   "device":{
      "identifiers": "901 room",
      "name":"901"
   }
}

# 湿度 homeassistant/sensor/112/901_senser3/config
{
   "name": "901 HUMIDITY s3",
   "device_class":"HUMIDITY",
   "state_topic":"homeassistant/sensor/112/901_senser/state",
   "unique_id":"senser901_3",
   "value_template":"{{ value_json.humidity}}",
   "device":{
      "identifiers":"901 room",
      "name":"901"
   }
}

# homeassistant/sensor/112/test_sensor/config
{
   "name": "901 test_sensor",
   "device_class":"temperature",
   "state_topic":"homeassistant/sensor/112/test_sensor/state",
   "json_attributes_path":"homeassistant/sensor/112/test_sensor/state",
   "unique_id":"test_sensor_1",
   "value_template":"{{ value_json.temperature}}",
   "json_attributes_template": "{{ value_json.list | to_json}}",
   "device":{
      "identifiers": "901 room",
      "name":"901"
   }
}
```

Name: entity 名称

device_class: 设备的类型，这里是temputre和humidity，carbon_dioxide, 其他类型查看[文档](https://www.home-assistant.io/integrations/sensor#device-class)

state_topic: 设置设备类型的更新主题，注意上面的两个实体，更新同一个设备(device)

value_template: 从接受的payload中按key查找值， [文档](https://www.home-assistant.io/docs/configuration/templating/#using-templates-with-the-mqtt-integration)

unique_id： sensor的唯一ID，

device.identifiers: sensor所属的device的唯一ID

device.name： device的名称

# 更新数据

向设备发现里定义的state_topic发送数据

```JSON
# homeassistant/sensor/112/901_senser/state

{
   "temperature":23.20,
   "humidity":43.70
}



# homeassistant/sensor/112/test_sensor/attributes
{
   "temperature":23.20,
   "humidity":43.70,
   "high": 123,
   "list": [12,2,3]
}
```