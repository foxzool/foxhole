---
Status: 🟩
tags:
  - input/articles
Links:
  - "[[UnrealEngine MOC]]"
Created: 2024-08-06T12:09:48
Source:
  - https://blog.csdn.net/qq_39934403/article/details/116498352
Author: 
Collection: 
Finished: "[[2024-08-06]]"
Rating:
---

使用内置的json模块之前，在项目的Build.cs文件中，包含一下Json，JsonUtilities模块。

```c++
void ParseJsonObject(const FString messageStr)
{
    TSharedPtr<FJsonObject>jsonObject;        //FJsonObject类型
	TSharedRef<TJsonReader<TCHAR>>jsonReader=TJsonReaderFactory<TCHAR>::Create(messageStr);//类型转换
	bool isSe = FJsonSerializer::Deserialize(jsonReader, jsonObject);        //序列化，返回FJsonObject类型数据
	if (isSe)    //判断一下是否转换成功
	{
		FString func = jsonObject->GetStringField("function");		//function字符串参数
		FString content = jsonObject->GetStringField("content");	//content字符串参数
		TSharedPtr<FJsonObject> paramsObject=jsonObject->GetObjectField("params");		//params参数FJsonObject类型
        TArray<TSharedPtr<FJsonValue>> behaviorsArray = paramsObject->GetArrayField("behaviors");		//params下的behaviors数组参数
 
        for(int i=0;i<behaviorsArray.Num();i++)        //遍历数组
    	{
		    
            FString timeStr=behaviorsArray[i]->AsObject()->GetStringField("start_time");		//behaviors数组下的behavior的开始时间
		    float startTime=FCString::Atof(*timeStr);		//开始时间float类型
		    TSharedPtr<FJsonObject> behaviorObj=behaviorsArray[i]->AsObject()->GetObjectField("behavior");	//behaviors数组下的behavior参数	
		    FString beFuncStr=behaviorObj->GetStringField("function");			//behavior下的function字符串参数
		    TSharedPtr<FJsonObject> beParam=behaviorObj->GetObjectField("params");		//behavior下的params参数
		    FString filePathStr=beParam->GetStringField("filePath");		//params参数下的filePath字符串参数
	
 
	    }
		
    }
}
```
