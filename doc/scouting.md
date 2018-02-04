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

#### Expected Response 
Data type: text  
Status code: 200  
Data: `200 OK`

### Request Spot
#### Request: 
Method: `GET`  
URL: `/member/scouting/request`  

#### Expected Response 
Data type: JSON  
Status Code: 200  
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

### Upload Data
#### Request
Method: `POST`  
URL: `/member/scouting/upload`  
POST body:
```json
{
  "email": "19johnd@students.harker.org",
  "blue": true,
  "team": 1072,
  "round": 55,
  "tournament_id": "59b1",
  "data": [
    {
      "timestamp": 123456789,
      "action": 6728
    },
    {
      "timestamp": 123456790,
      "action": 9345
    }
  ]
}
```

#### Expected Response 
Data type: text
Status code: 200
Data: `200 OK`

## Websockets (Client => Server)
### Set Match
Message: `set_match`  
Data:  
`{ "match": 0 }`   
Value of `match` sets the new round.

### Match Started
Message: `start_match`


