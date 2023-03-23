require('dotenv').config();

var router = module.exports = require('express').Router();
const axios = require('axios');
const querystring = require("querystring");
const userORM = require('../models/user');
const messageHandler = require('../util/messageHandler');


router.post("/", async (req, res) => {
        
    try {
        const playerName = req.body.summoner;
        const tagName = req.body.tag;

        console.log(playerName);
        console.log(tagName);
        let riot = await axios.get(`https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${playerName}/${tagName}`, {
            method: 'GET',
            headers: {
                "X-Riot-Token": process.env.RIOT_API_KEY
            }
        })

        const Puuid = riot.data.puuid;
        console.log(Puuid);

        riot = await axios.get(`https://americas.api.riotgames.com/lor/match/v1/matches/by-puuid/${Puuid}/ids`, {
            method: 'GET',
            headers: {
                "X-Riot-Token": process.env.RIOT_API_KEY
            }
        })

        let matchListCodes = riot.data;
        console.log(matchListCodes);
        let matchData = [];
        //Cant process all the request untill grow
        const limit = 1;
        for(let i = 0; i < limit; i++){
            matchData.push( await getMatch(matchListCodes[i]));
        }
        
        matchListCodes.splice(0, limit);
        let returnObj = {
            playerName: playerName,
            tagName: tagName,
            matchListCodesLeft: matchListCodes,
            lastMatches: matchData
        }

        res.status(200).json(returnObj);
    } catch (error) {
        console.log(error);
        //Axios Call
        if(error.response != undefined)
            if(error.response.status !== undefined)
                res.status(error.response.status).json({message: error.response.statusText}); 
        
        res.status(500).json( {message: error });
    }   
})

router.get("/match/:matchId", async (req, res) => { 
    const matchId = req.params.matchId;
    try{
       const match = await getMatch(matchId);
       res.status(200).json(match)
    } catch (error) {
        //Axios Call
        if(error.response.status !== undefined)
            res.status(error.response.status).json({message: error.response.statusText}); 
        
        res.status(500).json( {message: error });
    }
    
})

const getMatch = async (matchCode) => {
    let match = null;
    try{
        riot = await axios.get(`https://americas.api.riotgames.com/lor/match/v1/matches/${matchCode}`, {
            method: 'GET',
            headers: {
                "X-Riot-Token": process.env.RIOT_API_KEY
            }
        })

        match = riot.data.info;

        //Get Player One
        try{
            let playerOne = await axios.get(`https://americas.api.riotgames.com/riot/account/v1/accounts/by-puuid/${match.players[0].puuid}`, {
                    method: 'GET',
                    headers: {
                        "X-Riot-Token": process.env.RIOT_API_KEY
                }
            })
            match.players[0].summoner = playerOne.data.gameName;
            match.players[0].tag = playerOne.data.tagLine;
            
            let playerTwo = await axios.get(`https://americas.api.riotgames.com/riot/account/v1/accounts/by-puuid/${match.players[1].puuid}`, {
                    method: 'GET',
                    headers: {
                        "X-Riot-Token": process.env.RIOT_API_KEY
                    }
            })  
            
            match.players[1].summoner = playerTwo.data.gameName;
            match.players[1].tag = playerTwo.data.tagLine;;
        
        }catch(playerNameErr){
            console.log(playerNameErr)
        }

        return match;
    }catch(error){
        /*Make better seems custom matchs against friends */
        console.log(error)
        if(error.response){      
            if(error.response.status=== 404){
                let obj = {
                    game_mode: "Friends or Labas",
                    game_type: "AI",
                    game_start_time_utc: Date.now(),
                    game_version: null,
                    players: [],
                    total_turn_count: null,
                    summoner: null,
                }

                match = obj;
                return match;
            }

            if(error.response.status=== 429){
                //hope not to have probelm "Rate limit exceeded"
                console.log("test");
                function RiotException(code, message) {
                    this.message = message;
                    this.code = code;
                    this.name = 'RiotException';
                  }
                 throw new RiotException(429, "sdklfjlksjaflkjalfsdkjdlksajflksajf")
            }
        }

    } 
}