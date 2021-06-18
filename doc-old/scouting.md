# Scouting API
[main Github](https://github.com/HarkerRobo/robotics-website/) |
[main README](https://github.com/HarkerRobo/robotics-website/README.md)

Built for the 2018 First Power Up competition.

## Ranks

| Rank     | Abbreviation | API Number |Description |
|:----------:|:--------------:|:--------:|------------|
| Sergeant | Sgt.         | 10      | The Sergeant (or Squad Leader) manages each match. They manage who is scouting, report when each part (auton and tele-op) of the round starts, and add comments to the round for more insight. (In the 2018 competition, they also report when the scales are tipped in which direction and when each team uses which powerup). |
| Private  | Pvt.         | 0      | The Privates manages each team in a match. Their efforts are specific for each competition. (In the 2018 competition, they report when their robot puts blocks where, and where their robot starts). |

## Progression

### Login
First, the user must login using Google oAuth through the server. 
This way, the server can verify that the user is approved to scout and log the number of rounds each person scouts.

### Request Spot
Then, the user must request a spot on the scouting team (per match). 
The server will return the users rank, what team or alliance they are scouting, and information on the match. 

### Sergeant Makes Websocket Connection
If the server responds to the spot request saying that the user is a sergeant, the user is to then create a websocket connection with the server using [socket.io](https://socket.io/). Only one person will be able to have a connection to the server at a time. Note that if the sergeant disconnects, when another user with the ability to be sergeant requests a spot, they will be given sergeant rank, and the first sergeant will not be allowed to reconnect. In this scenario, if the previous sergeant started last match, the new sergeant will be set to the next match.  
Sergeants have other websocket commands they can issue, specified in the [Websockets section](#websockets). 

### Upload
Finally, each scout will "upload" their results to the server which they recorded during the match.

## Routes

### Login
Note that all URL's are proceded by the domain of the current website (https://robotics.harker.org).
#### Request
Method: `POST`  
URL: `/member/token`  
POST body:  
```json
{
  "idtoken": "dsfjkljfksdfjsljdfkljdfkls",
  "android": false,
}
```
Explanation:

You get the sign in token depending on the platform you are using. [This tutorial](https://developers.google.com/identity/) explains how to get it pretty well.

If you are logging in from an Android device, set the value of `"android"` to `true`.

#### Expected Response 
Data type: text  
Status code: 200  
Data: `200 OK`

#### 400 Error Response
Error given when the token could not be validated by Google API.

Data type: text  
Status code: 400  
Data: `Token does not match Google Client ID`

#### 401 Error Response
Error interfacing with the database while finding the user with email defined by `idtoken`.

Data type: text  
Status code: 401  
Data: `Could not find user with email 19johnd@students.harker.org`

#### 422 Error Response
Error given when POST body is invalid

Data type: text  
Status code: 422  
Data: `No token given (must be given in POST body as idtoken)`

### Request Spot
#### Request: 
Method: `GET`  
URL: `/member/scouting/request/<round>` (replace `<round>` with the current round as an integer)

#### Expected Response 
Data type: JSON  
Status code: 200  
Data: 
```json
{
  "tournament": {
    "year": 2018,
    "name": "SVR",
    "id": "59b1"
  },
  "scouting": {
    "round": 55,
    "rank": 0,
    "blue": true,
    "team": 1072
  }
}
```

Explanation:

| Field      | Description | Type | Example |
|:------------:|-------------|------|---------|
| tournament.year | The competition "year" | Integer | 2018 |
| tournament.name | The name of the tournament | String | "SVR" |
| tournament.id   | The ObjectId of the tournament on the server | String | "59b1" |
| scouting.round  | The round for which the user is scouting | Integer | 55 |
| scouting.rank   | The rank of the user ([based on API Number above](#ranks)) | Integer | 0 |
| scouting.blue   | True if the user is scouting for the blue team; otherwise false (not given for Sgts) | Boolean | true |
| scouting.team   | The team number of the team the user is scouting for (not given for Sgts) | Integer | 1072 |

#### 404 Error Response
Given if the param `<round>` does not exist in the tournament.

Data type: JSON  
Status code: 404  
Data:  
```json 
{
  "success": false,
  "error": {
    "message": "Round does not exist"
  }
}
```

#### 409 Error Response
Given if the given round is full.

Data type: JSON  
Status code: 409  
Data:  
```json 
{
  "success": false,
  "error": {
    "message": "Round 22 is full"
  }
}
```

#### 422 Error Response
Given if the param `<round>` is not an integer.

Data type: JSON  
Status code: 422  
Data:  
```json
{
  "success": false,
  "error": {
    "message": "Round must be an integer"
  }
}
```

### Upload Data
#### Request
Method: `POST`  
URL: `/member/scouting/upload`  
POST body:
```json
{
  "headers": {
    "email": "19johnd@students.harker.org",
    "rank": 0,
    "blue": true,
    "team": 1072,
    "round": 55,
    "tournament_id": "59b1",
    "forceUpload": false
  },
  "data": {
    "start_position": 50,
    "crossed_line": true,
    "end_platform": false,
    "lift": 2,
    "auton-actions": [
      {
        "timestamp": 123456789,
        "action": "0_7_28"
      },
      {
        "timestamp": 123456790,
        "action": "0_2_345"
      }
    ],
    "teleop-actions": [
      {
        "timestamp": 123456789,
        "action": "0_7_28"
      },
      {
        "timestamp": 123456790,
        "action": "0_2_345"
      }
    ]
  }
}
```

Explanation:  

| Field      | Description | Type | Example |
|:------------:|-------------|------|---------|
| headers.email | The scouter's email | String | "19johnd@students.harker.org" |
| headers.rank | The API rank of the scouter | Number | 0 |
| headers.blue | Whether the scouter is scouting for the blue team (Not given for Sgts.) | Boolean | true |
| headers.team | The team the scouter is scouting | Number | 1072 |
| headers.round | The round that the scouter is scouting for | Number | 55 | 
| headers.tournament_id | The id of the tournament given by Request Spot | String | "59b1" |
| headers.forceUpload | Optional. Whether to overwrite the data if it has already been saved | Boolean | false |
| data.start_postion | The starting position given as a number, where the middle is zero, all the way on the right is 100, and all the way left is -100 | Number | 50 |
| data.crossed_line | Whether the robot crossed the auto line during autonomous | Boolean | true |
| data.end_platform | Whether the robot ended the round on the platform | Boolean | false |
| data.lift | 0 - Did not do anything for lifting. 1 - Someone used my single ramp. 2 - someone used my double ramp 3 - used ramp or buddy lift. 4 - Climbed onto bar 5 - Climbed onto bar carrying another bot  | Number | 2 |
| data.actions | An array of JSON Objects, each with a timestamp property (`timestamp`) and an action id property (`action`). Action IDs are given below. | JSON Array | `[{ "timestamp": 123456789, "action": "0_7_28" }, { "timestamp": 123456790, "action": "0_2_345" } ]` |

Action IDs:

| ID | Rank | Type | Action |
|:--:|-|-|-|
| 0_0_0 | Pvt. | Place Block | Place block on **Home switch** |
| 0_0_1 | Pvt. | Place Block | Place block on **scale** |
| 0_0_2 | Pvt. | Place Block | Place block on **Away switch** |
| 0_0_3 | Pvt. | Place Block | Place block in **Vault** |
| 0_1_0 | Pvt. | Get Block | Get block from **Home portal** |
| 0_1_1 | Pvt. | Get Block | Get block from **Away portal** |
| 0_1_2 | Pvt. | Get Block | Get block from **Power Cube Zone** |
| 0_1_3 | Pvt. | Get Block | Get block from **Home Power Cube Line** |
| 0_1_4 | Pvt. | Get Block | Get block from **Away Power Cube Line** |
| 10_0_0 | Sgt. | Tilt | The **Red Switch** is tilted in favor of the **red team** |
| 10_0_1 | Sgt. | Tilt | The **Red Switch** is tilted in favor of **neither team** |
| 10_0_2 | Sgt. | Tilt | The **Red Switch** is tilted in favor of the **blue team** |
| 10_0_3 | Sgt. | Tilt | The **Scale** is tilted in favor of the **red team** |
| 10_0_4 | Sgt. | Tilt | The **Scale** is tilted in favor of **neither team** |
| 10_0_5 | Sgt. | Tilt | The **Scale** is tilted in favor of the **blue team** |
| 10_0_6 | Sgt. | Tilt | The **Blue Switch** is tilted in favor of the **red team** |
| 10_0_7 | Sgt. | Tilt | The **Blue Switch** is tilted in favor of **neither team** |
| 10_0_8 | Sgt. | Tilt | The **Blue Switch** is tilted in favor of the **blue team** |
| 10_1_0 | Sgt. | Power Up | The **red** team used the **force** power up |
| 10_1_1 | Sgt. | Power Up | The **blue** team used the **force** power up |
| 10_1_2 | Sgt. | Power Up | The **red** team used the **block** power up |
| 10_1_3 | Sgt. | Power Up | The **blue** team used the **block** power up |
| 10_1_4 | Sgt. | Power Up | The **red** team used the **levitate** power up |
| 10_1_5 | Sgt. | Power Up | The **blue** team used the **levitate** power up |


#### Expected Response 
Data type: text  
Status code: 200  
Data: `200 OK`  

#### 401 Error Response
Given when the team member claims to be a sergeant (in the POST body headers) but is not authorized to be one.

Data type: JSON  
Status code: 401  
Data: 
```json
{ 
  "success":false,
  "error":{
    "message": "User is not authorized as a scouting sergeant"
  }
}
```

#### 403 Error Response
Given when the team member claims to be someone they are not (in the POST body headers), and they are not authorized as a sergeant.

Data type: JSON  
Status code: 403  
Data: 
```json
{ 
  "success":false,
  "error":{
    "message": "Email does not match login email"
  }
}
```

#### 404 Error Response
Given when the team number, tournament, and round do not match in the database.

Data type: JSON  
Status code: 404  
Data: 
```json
{ 
  "success":false,
  "error":{
    "message": "Team with number 1000 not found in round 22 in tournament with id 5a98cdbf73054f6655a07c5c"
  }
}
```

#### 409 Error Response
Given when the data has already been uploaded and `forceUpload` was not set to `true`.

Data type: JSON  
Status code: 409  
Data: 
```json
{ 
  "success":false,
  "error":{
    "message": "Data has already been uploaded for team 1000 on round 22 in tournament with id 5a98cdbf73054f6655a07c5c"
  }
}
```

#### 422 Error Response
Given when the upload data is formatted incorrectly.

Data type: JSON  
Status code: 422  
Data: 
```json
{ 
  "success":false,
  "error": {
    "message": "Rank not set in POST body headers (req.body.headers.rank = undefined)"
  }
}
 ```


