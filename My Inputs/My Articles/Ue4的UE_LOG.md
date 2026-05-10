---
Status: 🟩
tags:
  - input/articles
  - UnrealEngine
Links:
  - "[[UnrealEngine MOC]]"
Created: 2024-08-07T10:47:21
Source:
  - https://www.cnblogs.com/blueroses/p/6037981.html
Author: 
Collection: 
Finished: "[[2024-08-07]]"
Rating:
---
### Log Message

//"This is a message to yourself during runtime!"
UE_LOG(YourLog,Warning,TEXT("This is a message to yourself during runtime!"));

### Log an FString

 %s strings are wanted as TCHAR* by Log, so use *FString()
//"MyCharacter's Name is %s"
UE_LOG(YourLog,Warning,TEXT("MyCharacter's Name is %s"), *MyCharacter->GetName() );

### Log an Int

//"MyCharacter's Health is %d"
UE_LOG(YourLog,Warning,TEXT("MyCharacter's Health is %d"), MyCharacter->Health );

### Log a Float

//"MyCharacter's Health is %f"
UE_LOG(YourLog,Warning,TEXT("MyCharacter's Health is %f"), MyCharacter->Health );

### Log an FVector

//"MyCharacter's Location is %s"
UE_LOG(YourLog,Warning,TEXT("MyCharacter's Location is %s"), 
    *MyCharacter->GetActorLocation().ToString());

### Log an FName

//"MyCharacter's FName is %s"
UE_LOG(YourLog,Warning,TEXT("MyCharacter's FName is %s"), 
    *MyCharacter->GetFName().ToString());

### Log an FString,Int,Float

//"%s has health %d, which is %f percent of total health"
UE_LOG(YourLog,Warning,TEXT("%s has health %d, which is %f percent of total health"),
    *MyCharacter->GetName(), MyCharacter->Health, MyCharacter->HealthPercent);