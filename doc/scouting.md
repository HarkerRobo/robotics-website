# Scouting API
[main Github](https://github.com/HarkerRobo/robotics-website/) |
[main README](https://github.com/HarkerRobo/robotics-website/README.md)
Built for the 2018 First Power Up competition.

## Ranks

| Rank     | Abbreviation | API Number |Description |
|:----------:|:--------------:|:--------:|------------|
| Sergeant | Sgt.         | 10      | The Sergeant (or Squad Leader) manages each match. They manage who is scouting, report when each part (auton and tele-op) of the round starts, and add comments to the round for more insight. (In the 2018 competition, they also report when the scales are tipped in which direction). |
| Corporal | Cpl.         | 5      | The Corporals manages each alliance in a match. They report when each part (auton and tele-op) of the round starts, and add comments on each team for more insight. (In the 2018 competition, they also report when their team uses a power up). |
| Private  | Pvt.         | 0      | The Privates manages each team in a match. Their efforts are specific for each competition. (In the 2018 competition, they report when their robot puts blocks where, and where their robot starts). |

## Progression

### Login
First, the user must login using Google oAuth through the server. 
This way, the server can verify that the user is approved to scout and log the number of rounds each person scouts.

### Request Spot
Then, the user must request a spot on the scouting team (per match). 
The server will return the users rank, what team or alliance they are scouting, and information on the match. 

### Upload
Finally, each scout will "upload" their results to the server which they recorded during the match.

## Routes

### Login
[I'll look into this]

### Request Spot
Request: `/member/scouting/request`

Response: 
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
| scouting.team   | The team number of the team the user is scouting for (not given for Sgts and Cpls) | Integer | 1072 |
