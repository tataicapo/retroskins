const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');
//const config = require('./config');
var express = require('express');
var app = express();
const database = "revueltoderadio.com/otras/retroskins/"

const bodyParser = require('body-parser');

app.use(require('connect').bodyParser());


var server_port = process.env.PORT || 8080
var accountName, password, sharedSecret, identitySecret;
try {
	const config = require('./config');
	accountName = config.accountName;
	password = config.password;
	sharedSecret = config.sharedSecret;
	identitySecret = config.identitySecret;
} catch (error) {
	accountName = process.env.accountName;
	password = process.env.password;
	sharedSecret = process.env.sharedSecret;
	identitySecret = process.env.identitySecret;
}

/*
app.get('/', function (req, res) {
	res.send('Hello World!');
});

app.get('/inventory', function (req, res) {
	bodyParser.json()
	console.log(req.body)
	//if(req){
		res.send(req.body);
		//res.sendStatus(200);
	//}
	if(res){
		console.log(res)
	}
});
*/

app.route('/inventory')
.get(function(req, res, next) {
	console.log(req)
	res.sendStatus(200);
})
.post(function(req, res, next) {
	console.log(req)
	res.sendStatus(200);
})

app.listen(server_port, function () {
	console.log('Start in port '+server_port);
});

const client = new SteamUser();
const community = new SteamCommunity();
const manager = new TradeOfferManager({
	steam: client,
	community: community,
	language: 'es'
});

const logInOptions = {
	accountName: accountName,
	password: password,
	twoFactorCode: SteamTotp.generateAuthCode(sharedSecret)
};

client.logOn(logInOptions);

client.on('loggedOn', () => {
	console.log('-logged on');
	
	client.setPersona(SteamUser.EPersonaState.Online);
	client.gamesPlayed('nodejs tutorial');
});

client.on('webSession', (sid, cookies) => {
	manager.setCookies(cookies);
	community.setCookies(cookies);
	community.startConfirmationChecker(20000, identitySecret);
	sendFloralShirt();
});

manager.on('newOffer', offer => {
	console.log('offer detected');
	if (offer.partner.getSteamID64() === '76561198864031631') {
		offer.accept((err, status) => {
			if (err) {
				console.log(err);
			} else {
				console.log(status);
			}
		})
	} else {
		console.log('unknown sender');
		offer.decline(err => {
			if (err) {
				console.log(err);
			} else {
				console.log('trade from stranger declined');
			}
		});
	}
});

function sendFloralShirt() {
	console.log("-sendFloralShirt")
	manager.loadInventory(730, 2, true, (err, inventory) => {
		if (err) {
			console.log('-loadInventory-error')
			console.log(err);
		} else {
			console.log('-loadInventory-true')
			const offer = manager.createOffer('76561198864031631');
			//console.log(inventory)
			inventory.forEach(function(item) {
				if (item.assetid === '8507890831') {
					offer.addMyItem(item);
					offer.setMessage('You received a floral shirt!');
					offer.send((err, status) => {
						if (err) {
							console.log(err);
						} else {
							console.log('trade sent');
							console.log(status);
						}
					})
				}
			})
		}
	})
}
