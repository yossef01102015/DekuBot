var config = require("../config.json");
var userDB = require("./user_rt.js");
var guildDB = require("./guild_rt.js");
var permissionDB = require("./permission_rt.js");
var factionDB = require("./faction_rt.js");
var mangaDB = require("./manga_track_rt.js");
var redditDB = require("./reddit_rt.js");
var functions = require("./functions.js");
var battleDB = require("./battle_rt.js");
var customcommands = require("./custom_command_rt.js");

var jimp = require("jimp");
var parseString = require('xml2js').parseString;
var nani = require("nani").init(config.anilistID, config.anilist_Secret);
var nedb = require("nedb")
var request = require("request");
var youtubeNode = require("youtube-node");
var ytdl = require("ytdl-core");
var Commands = [];

Commands.help = {
	name: "help",
	help: "tbd",
	type: "general",
	lvl: 0,
	func: function(bot, msg) {
  	msg.reply(" 📙 https://github.com/RoddersGH/DekuBot/wiki/General-Commands 📙 ");
  }
};

Commands.ping = {
	name: "ping",
	help: "tbd",
	type: "general",
	lvl: 0,
	func: function(bot, msg) {
  	msg.reply(":ping_pong:");
  }
};

Commands.pong = {
	name: "pong",
	help: "tbd",
	type: "general",
	lvl: 0,
	func: function(bot, msg) {
  	msg.reply("Received command in--- wait, hold on, you're supposed to *ping* me! I haven't the slightest clue how to respond to this *pong* nonsense.");
  }
};

Commands.purge = {
	name: "purge",
	help: "tbd",
	type: "admin",
	lvl: 1,
	func: function(bot, msg, args) {
    if (msg.channel.type == 'dm') {
      msg.channel.sendMessage("```diff\n- You can't do that in a DM you silly silly person!```");
      return;
    }
    if (!args || isNaN(args)) {
      msg.channel.sendMessage("```diff\n- Please define an amount of messages for me to delete!```");
      return;
    }
    if (!msg.member.hasPermission("MANAGE_MESSAGES")) {
      msg.channel.sendMessage("```diff\n- Your role in this guild does not have enough permissions.```");
      return;
    }
    if (!msg.guild.members.find("id", bot.user.id).hasPermission("MANAGE_MESSAGES")) {
      msg.channel.sendMessage("```diff\n- I don't have permission to do that!```");
      return;
    }
    if (args > 100) {
      msg.channel.sendMessage("```diff\n- The maximum is 100.```");
      return;
    }
    msg.channel.fetchMessages({limit: args}).then(messages => {
      msg.channel.bulkDelete(messages).then(deleted => {
				msg.channel.sendMessage("Done ✔ Deleted " + deleted.array().length + " messages.");
			})
		})
  }
};

Commands.namechanges = {
	name: "namechanges",
	help: "tbt",
	type: "general",
	lvl: 0,
	func: function(bot, msg) {
		if ((msg.mentions.users.array().length === 0) || (msg.mentions.users.array().length > 1)) {
			msg.channel.sendMessage("```diff\n- Please mention a single user.```");
		} else {
			msg.mentions.users.map(function(user) {
	      userDB.returnNamechanges(user).then(function(reply) {
	        msg.channel.sendMessage(reply.join(', '));
	      }).catch(function(err) {
	        if (err === 'No changes found!') {
	          msg.channel.sendMessage("I don't have any changes registered 📒");
	          return;
	        }
	        msg.channel.sendMessage('❌ Something went wrong, try again later.');
	      });
	    });
		}
  }
};

Commands.botstatus = {
	name: "botstatus",
	help: "tbd",
	type: "general",
	lvl: 0,
	func: function(bot, msg) {
		var channelcount = 0;
		var usercount = 0;
		var finalstring = [];

		for (guild of bot.guilds.array()) {
			for (channel of guild.channels.array() ) {
				channelcount++;
			};
			for (member of guild.members.array()) {
				usercount++;
			};
		};

		finalstring.push("Hi! Im DekuBot :robot:");
		finalstring.push("Im currently used in ``" + bot.guilds.array().length + "`` server(s), in ``" + channelcount + "`` channels used by ``" + usercount + "`` users.");
		finalstring.push("I've been up and ready for ``" + (Math.round(bot.uptime / (1000 * 60 * 60))) + "`` hours, ``" + (Math.round(bot.uptime / (1000 * 60)) % 60) + "`` minutes, and ``" + (Math.round(bot.uptime / 1000) % 60 + ".") + "`` seconds.");
	  finalstring.push("If you have any questions or need some help, contact **RoddersGH#4702**")
		finalstring.push("```         __    __");
		finalstring.push("        /  |  | |'-.");
		finalstring.push("       .|__/  | |   |");
		finalstring.push("    _ /  `._  |_|_.-'");
		finalstring.push("   | /  |__.`=._) (_");
		finalstring.push('   |/ ._/  |"""""""""|');
		finalstring.push("   |'.  ` )|         |");
		finalstring.push('   ;"""/ / |         |');
		finalstring.push("    ) /_/| |.-------.|");
		finalstring.push("   o  `-`o o         o	```");
		msg.channel.sendMessage(finalstring);
  }
};

Commands.getpermissionlvl = {
	name: "getpermissionlvl",
	help: "tbd",
	type: "admin",
	lvl: 1,
	func: function(bot, msg, args) {
		if ((msg.mentions.users.array().length === 0) || (msg.mentions.users.array().length > 1)) {
			msg.reply("```diff\n- Please mention a user```");
		} else {
			permissionDB.getPermission(msg.channel.guild.id, msg.mentions.users.array()[0].id).then(function(r) {
				msg.channel.sendMessage(r);
			});
		}
  }
};

Commands.setpermissionlvl = {
	name: "setpermissionlvl",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args) {
		var num = args.substr(args.indexOf(" ") + 1)
		var isnum = /^\d+$/.test(num);
		if ((msg.mentions.users.array().length === 0) || (msg.mentions.users.array().length > 1)) {
			msg.reply("```diff\n- Please mention a user```");
			return;
		} else {
			if (!num || isnum == false || (num == 4) || (num == 5) || (num < 0) || (num > 6)) {
				msg.channel.sendMessage("```diff\n- Please define the permission level you wish to set for the user.```");
				return;
			} else {
				permissionDB.check(msg.channel.guild.id, msg.mentions.users.array()[0].id).catch(function(e) {
					console.log(e);
					if (e == 'Nothing found!1') {
						permissionDB.newPermission(msg.channel.guild, msg.mentions.users.array()[0]);
					};
				});
				permissionDB.getPermission(msg.channel.guild.id, msg.author.id).then(function(r) {
					permissionDB.setPermission(r, msg.channel.guild, msg.mentions.users.array()[0], num).then(function(res) {
						msg.channel.sendMessage(msg.mentions.users.array()[0] + res);
					}).catch(function(e) {
						msg.channel.sendMessage(e);
					});
				}).catch(function(e) {
					console.log(e);
				});
			}
	  }
  }
};

Commands.createfaction = {
	name: "createfaction",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args) {
		var name = args.substr(0, args.indexOf("#") - 1).toLowerCase();
		var hex = args.substr(args.indexOf("#"))
		var isHex = /^#[0-9A-F]{6}$/i.test(hex);

		if (isHex == false) {
			msg.channel.sendMessage("```diff\n- Please enter a valid Hex value of the format #<six digit hex number>.```");
			return;
		};
		factionDB.checkNameClash(msg.channel.guild, name).then(function() {
			var hex_int = parseInt("0x" + hex.substr(hex.indexOf("#") + 1), 16);
			msg.guild.createRole({
				color : hex_int,
				hoist : false,
				name : name,
				permissions : [
					"ATTACH_FILES", "SEND_MESSAGES", "READ_MESSAGES", "EMBED_LINKS", "READ_MESSAGE_HISTORY", "CREATE_INSTANT_INVITE", "CHANGE_NICKNAME", "CONNECT", "SPEAK", "USE_VAD"
				],
				mentionable: false
			}).then(role => {
				factionDB.createNewFaction(role.id, role.guild, role.name, hex_int, role.permissions);
				msg.channel.sendMessage("The faction " + role.name + " has been created ✔");
			}).catch(function(e) {
				msg.channel.sendMessage(e);
				return;
			})
		}).catch(function(e) {
			msg.channel.sendMessage(e);
			return;
		});
  }
};

Commands.faction = {
	name: "faction",
	help: "tbd",
	type: "general",
	lvl: 0,
	func: function(bot, msg, args) {
	  var msgArray = [];
	  var guildFactions = [];
		var found = false;
	  factionDB.getFactionsHere(msg.guild).then(function(guildFactions) {
			console.log('here1')
				for (i = 0; i < guildFactions.length; i++) {
					if (msg.member.roles.exists("id", guildFactions[i])) {
						console.log('Meme')
						msg.author.sendMessage("❌ Sorry, you are already in a faction. If you really want to change faction, message RoddersGH#4702");
						found = true;
					}
					if (found == false && i == guildFactions.length-1) {
						console.log('here')
						msgArray.push("Hello member of the " + msg.channel.guild.name + " server");
						msgArray.push("Im a new addition to the server made by the Admin @Rodders. I help with a bunch of things which you can check out by going to the following link ");
						msgArray.push("I hope you continue to have lots of fun discussing one piece with us!");
						msgArray.push("(If this message was an annoyance or was not intended for you then I sincerely apologise and would ask you to contact @Rodders on the server with any issues)");
						msgArray.push(" ");
						msgArray.push("We have different factions on the server that give you access to exclusive channels and faction leaderboards(still being made )!");
						msgArray.push("**If you want to join a faction, type the **number** next to the faction you wish to join.**" );
						msgArray.push("The factions are:" );
						msgArray.push("1. Pirates" );
						msgArray.push("2. Marines" );
						msgArray.push("3. Revolutionary Army" );

						functions.responseHandling(bot, msgArray, msg.author, msg.guild)
					}
				}
	  }).catch(function(e) {
			if (e == 'No factions found') {
				bot.sendMessage(msg.channel, 'This server has no factions in it at the moment. Message an admin if you wish for them to create factions for the server.' )
			}
		})
  }
};

Commands.ignore = {
	name: "ignore",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args) {
		guildDB.ignoreChannel(msg.channel).then(function(r) {
			msg.reply(r);
		}).catch(function(e) {
			msg.reply(e);
		})
  }
};

Commands.unignore = {
	name: "unignore",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args) {
		guildDB.unignoreChannel(msg.channel).then(function(r) {
			msg.reply(r);
		}).catch(function(e) {
			msg.reply(e);
		})
  }
};

Commands.anime = {
	name: "anime",
	help: "tbd",
	type: "weeb",
	lvl: 0,
	func: function(bot, msg, args) {
		msg.channel.sendMessage(" 🔍 *Searching...* 🔍");
		nani.get('anime/search/' + args).then(function(r) {
			if (r.length == 0 || r == null) {
				bot.reply(msg, "❌ Nothing found ");
				return
			} else {
				nani.get('anime/' + r[0].id).then(function(data) {
					msg.channel.sendMessage('http://anilist.co/anime/' + data.id + "   " + data.image_url_lge).then(message => {
						var msgArray = [];
						msgArray.push("**Names: **" + data.title_japanese + ", " + data.title_romaji + ", " + data.title_english);
						msgArray.push("**Type: **" + data.type);
						msgArray.push("**Genres: **" + data.genres);
						msgArray.push("**Score: **" + data.average_score);
						msgArray.push("**Status: **" + data.airing_status);
						if (data.total_episodes != 0) {
							msgArray.push("**# of Episodes: **" + data.total_episodes);
						}
						msgArray.push("**Start Date: **" + data.start_date.substr(0, 10));
						if (data.end_date) {
							msgArray.push("**End Date: **" + data.end_date.substr(0, 10));
						}
						var cleanText = data.description.replace(/<\/?[^>]+(>|$)/g, "");
						msgArray.push("**Description: **" + cleanText);
						msg.channel.sendMessage(msgArray);
					})
				}).catch(function(e) {
					console.log(e);
				});
			}
		}).catch(function(e) {
			console.log(e);
			msg.reply("❌ Nothing found ");
		});
  }
};

Commands.manga = {
	name: "manga",
	help: "tbd",
	type: "weeb",
	lvl: 0,
	func: function(bot, msg, args) {
		msg.channel.sendMessage(" 🔍 *Searching...* 🔍");
		nani.get('manga/search/' + args).then(function(r) {
			if (r.length == 0 || r == null) {
				msg.reply("❌ Nothing found ");
				return
			} else {
				nani.get('manga/' + r[0].id).then(function(data) {
					msg.channel.sendMessage('http://anilist.co/manga/' + data.id + "   " + data.image_url_lge).then(message => {
						var msgArray = [];
						msgArray.push("**Names: **" + data.title_japanese + ", " + data.title_romaji + ", " + data.title_english);
						msgArray.push("**Type: **" + data.type);
						msgArray.push("**Genres: **" + data.genres);
						msgArray.push("**Score: **" + data.average_score);
						msgArray.push("**Status: **" + data.airing_status);
						if (data.total_chapters != 0) {
							msgArray.push("**# of Chapters: **" + data.total_chapters + " In " + data.total_volumes + " Volumes.");
						}
						msgArray.push("**Start Date: **" + data.start_date.substr(0, 10));
						if (data.end_date) {
							msgArray.push("**End Date: **" + data.end_date.substr(0, 10));
						}
						var cleanText = data.description.replace(/<\/?[^>]+(>|$)/g, "");
						msgArray.push("**Description: **" + cleanText);
						msg.channel.sendMessage(msgArray);
					});
				}).catch(function(e) {
					console.log(e);
				});
			}
		}).catch(function(e) {
			console.log(e);
			msg.reply("❌ Nothing found ");
		});
  }
};

Commands.character = {
	name: "character",
	help: "tbd",
	type: "weeb",
	lvl: 0,
	func: function(bot, msg, args) {
		msg.channel.sendMessage(" 🔍 *Searching...* 🔍");
		nani.get('character/search/' + args).then(function(r) {
			if (r.length == 0 || r == null) {
				msg.reply("❌ Nothing found ");
				return
			} else {
				var msgArray1 = [];
				if (r.length > 1 ) {
					for (i = 0; i < r.length; i++) {
						msgArray1.push("[ " + (i+1) + " ]  -  " + r[i].name_last + " " + r[i].name_first);
					}
				} else if (r.length == 1) {
				nani.get('character/' + r[0].id).then(function(data) {
					msg.channel.sendMessage('http://anilist.co/character/' + data.id + "   " + data.image_url_lge).then(message => {
						var msgArray = [];
						msgArray.push("**Names: **" + data.name_last + " " + data.name_first + ", " + data.name_alt + ", " + data.name_japanese);
						var a = data.info.replace(/__/g, "**");
						var b = a.replace(/~!/g, " ");
						var c = b.replace(/!~/g, " ");
						if (data.info.length >= 1600) {
							msgArray.push("**Description: **\n\n" + c.substr(0, 1600) + "...       _click the first link above to read more_");
						} else {
							msgArray.push("**Description: **\n\n" + c);
						}
						msg.channel.sendMessage(msgArray);
					});
				}).catch(function(e) {
					console.log(e);
					msg.reply("❌ Nothing found ");
				});
				return;
				}
				msg.channel.sendMessage("**Please choose one be giving a number:**").then(mesg => {
					mesg.author = msg.author
					functions.responseHandlingREG(bot, mesg, msgArray1, msg.author).then(function(num){
						if (num > 0 && num <= r.length && num.length <= 2) {
							nani.get('character/' + r[num-1].id).then(function(data) {
								msg.channel.sendMessage('http://anilist.co/character/' + data.id + "   " + data.image_url_lge).then(message => {
									var msgArray = [];
									msgArray.push("**Names: **" + data.name_last + " " + data.name_first + ", " + data.name_alt + ", " + data.name_japanese);
									var a = data.info.replace(/__/g, "**");
									var b = a.replace(/~!/g, " ");
									var c = b.replace(/!~/g, " ");
									var d = c.replace(/&#039;/, "'")
									if (data.info.length >= 1600) {
										msgArray.push("**Description: **\n\n" + d.substr(0, 1600) + "...       _click the first link above to read more_");
									} else {
										msgArray.push("**Description: **\n\n" + d);
									}
									msg.channel.sendMessage(msgArray);
								});
							}).catch(function(e) {
								console.log(e);
							});
						}
					}).catch(function(e) {
						console.log(e);
						msg.reply("❌ Nothing found ");
					});

				});
			}
		}).catch(function(e) {
			msg.reply("❌ Nothing found ");
			console.log(e);
		});
  }
};

Commands.animesearch = {
	name: "animesearch",
	help: "tbd",
	type: "weeb",
	lvl: 0,
	func: function(bot, msg, args) {
		msg.channel.sendMessage(" 🔍 *Searching...* 🔍");
		nani.get('anime/search/' + args).then(function(r) {
			if (r.length == 0 || r == null) {
				msg.reply("❌ Nothing found ");
				return
			} else {
				var msgArray1 = [];
				if (r.length > 1 ) {
					for (i = 0; i < r.length; i++) {
						msgArray1.push("[ " + (i+1) + " ]  -  " + r[i].title_english);
					}
				} else if (r.length == 1) {
				nani.get('anime/' + r[0].id).then(function(data) {
					msg.channel.sendMessage('http://anilist.co/anime/' + data.id + "   " + data.image_url_lge).then(message => {
						var msgArray = [];
						msgArray.push("**Names: **" + data.title_japanese + ", " + data.title_romaji + ", " + data.title_english);
						msgArray.push("**Type: **" + data.type);
						msgArray.push("**Genres: **" + data.genres);
						if (data.average_score == 0) {
							msgArray.push("**Score: **Undecided" );
						} else {
							msgArray.push("**Score: **" + data.average_score);
						}
						msgArray.push("**Status: **" + data.airing_status);
						if (data.total_episodes != 0) {
							msgArray.push("**# of Episodes: **" + data.total_episodes);
						}
						msgArray.push("**Start Date: **" + data.start_date.substr(0, 10));
						if (data.end_date) {
							msgArray.push("**End Date: **" + data.end_date.substr(0, 10));
						}
						if (data.description) {
							var cleanText = data.description.replace(/<\/?[^>]+(>|$)/g, "");
							msgArray.push("**Description: **" + cleanText);
						}
						msg.channel.sendMessage(msgArray);
					});
				}).catch(function(e) {
					console.log(e);
					msg.reply("❌ Nothing found ");
				});
				return;
				}
				msg.channel.sendMessage("**Please choose one be giving a number:**").then(mesg => {
					mesg.author = msg.author
					functions.responseHandlingREG(bot, mesg, msgArray1, msg.author).then(function(num){
						if (num > 0 && num <= r.length && num.length <= 2) {
							nani.get('anime/' + r[num-1].id).then(function(data) {
								msg.channel.sendMessage('http://anilist.co/anime/' + data.id + "   " + data.image_url_lge).then(message => {
									var msgArray = [];
									msgArray.push("**Names: **" + data.title_japanese + ", " + data.title_romaji + ", " + data.title_english);
									msgArray.push("**Type: **" + data.type);
									msgArray.push("**Genres: **" + data.genres);
									if (data.average_score == 0) {
										msgArray.push("**Score: **Undecided" );
									} else {
										msgArray.push("**Score: **" + data.average_score);
									}
									msgArray.push("**Status: **" + data.airing_status);
									if (data.total_episodes != 0) {
										msgArray.push("**# of Episodes: **" + data.total_episodes);
									}
									msgArray.push("**Start Date: **" + data.start_date.substr(0, 10));
									if (data.end_date) {
										msgArray.push("**End Date: **" + data.end_date.substr(0, 10));
									}
									if (data.description) {
										var cleanText = data.description.replace(/<\/?[^>]+(>|$)/g, "");
										msgArray.push("**Description: **" + cleanText);
									}
									msg.channel.sendMessage(msgArray);
								});
							}).catch(function(e) {
								console.log(e);
								msg.reply("❌ Nothing found ");
							});
						}
					}).catch(function(e) {
						console.log(e);
						msg.reply("❌ Nothing found ");
					});

				});
			}
		}).catch(function(e) {
			console.log(e);
			msg.reply("❌ Nothing found ");
		});
  }
};

Commands.mangasearch = {
	name: "mangasearch",
	help: "tbd",
	type: "weeb",
	lvl: 0,
	func: function(bot, msg, args) {
		msg.channel.sendMessage(" 🔍 *Searching...* 🔍");
		nani.get('manga/search/' + args).then(function(r) {
			if (r.length == 0 || r == null) {
				msg.reply("❌ Nothing found ");
				return
			} else {
				var msgArray1 = [];
				if (r.length > 1 ) {
					for (i = 0; i < r.length; i++) {
						msgArray1.push("[ " + (i+1) + " ]  -  " + r[i].title_english);
					}
				} else if (r.length == 1) {
					nani.get('manga/' + r[0].id).then(function(data) {
						msg.channel.sendMessage('http://anilist.co/manga/' + data.id + "   " + data.image_url_lge).then(message => {
							var msgArray = [];
							msgArray.push("**Names: **" + data.title_japanese + ", " + data.title_romaji + ", " + data.title_english);
							msgArray.push("**Type: **" + data.type);
							msgArray.push("**Genres: **" + data.genres);
							msgArray.push("**Score: **" + data.average_score);
							msgArray.push("**Status: **" + data.airing_status);
							if (data.total_chapters != 0) {
								msgArray.push("**# of Chapters: **" + data.total_chapters + " In " + data.total_volumes + " Volumes.");
							}
							msgArray.push("**Start Date: **" + data.start_date.substr(0, 10));
							if (data.end_date) {
								msgArray.push("**End Date: **" + data.end_date.substr(0, 10));
							}
							var cleanText = data.description.replace(/<\/?[^>]+(>|$)/g, "");
							msgArray.push("**Description: **" + cleanText);
							msg.channel.sendMessage(msgArray);
						});
					}).catch(function(e) {
						console.log(e);
						msg.reply("❌ Nothing found ");
					});
				return;
				}
				msg.channel.sendMessage("**Please choose one be giving a number:**").then(mesg => {
					mesg.author = msg.author
					functions.responseHandlingREG(bot, mesg, msgArray1, msg.author).then(function(num){
						if (num > 0 && num <= r.length && num.length <= 2) {
							nani.get('manga/' + r[num-1].id).then(function(data) {
								msg.channel.sendMessage('http://anilist.co/manga/' + data.id + "   " + data.image_url_lge).then(message => {
									var msgArray = [];
									msgArray.push("**Names: **" + data.title_japanese + ", " + data.title_romaji + ", " + data.title_english);
									msgArray.push("**Type: **" + data.type);
									msgArray.push("**Genres: **" + data.genres);
									msgArray.push("**Score: **" + data.average_score);
									msgArray.push("**Status: **" + data.airing_status);
									if (data.total_chapters != 0) {
										msgArray.push("**# of Chapters: **" + data.total_chapters + " In " + data.total_volumes + " Volumes.");
									}
									msgArray.push("**Start Date: **" + data.start_date.substr(0, 10));
									if (data.end_date) {
										msgArray.push("**End Date: **" + data.end_date.substr(0, 10));
									}
									var cleanText = data.description.replace(/<\/?[^>]+(>|$)/g, "");
									msgArray.push("**Description: **" + cleanText);
									msg.channel.sendMessage(msgArray);
								});
							}).catch(function(e) {
								console.log(e);
								msg.reply("❌ Nothing found ");
							});
						}
					}).catch(function(e) {
						console.log(e);
						msg.reply("❌ Nothing found ");
					});
				});
			}
		}).catch(function(e) {
			console.log(e);
			msg.reply("❌ Nothing found ");
		});
  }
};

Commands.animeairdate = {
	name: "animeairdate",
	help: "tbd",
	type: "weeb",
	lvl: 0,
	func: function(bot, msg, args) {
		msg.channel.sendMessage(" 🔍 *Searching...* 🔍");
		nani.get('anime/search/' + args).then(function(r) {
			if (r.length == 0 || r == null) {
				msg.reply("❌ Nothing found ");
				return
			} else {
				nani.get('anime/' + r[0].id).then(function(data) {
					msg.channel.sendMessage('http://anilist.co/anime/' + data.id + "   " + data.image_url_lge).then(message => {
						var msgArray = [];
						console.log(data.airing_status);
						if (data.airing_status == 'finished airing' || data.airing_status == 'not yet aired') {
							msgArray.push("**Status: **" + data.airing_status);
						} else {
							var date = new Date(null);
							date.setSeconds(data.airing.countdown); // specify value for SECONDS here
							var formattedDate = date.toISOString().substr(8,2)-1 + " Days, " + date.toISOString().substr(11,2) + " Hours, " + date.toISOString().substr(14,2) + " Minutes"

							msgArray.push("**Next Episode: **" + data.airing.next_episode);
							msgArray.push("**Airing On: **" + data.airing.time.substr(0, 10));
							msgArray.push("**Countdown: ** :hourglass_flowing_sand: " + formattedDate);
						}

						msg.channel.sendMessage(msgArray);
					});
				}).catch(function(e) {
					console.log(e);
					msg.reply("❌ Nothing found ");
				});
			}
		}).catch(function(e) {
			console.log(e);
			msg.reply("❌ Nothing found ");
		});
  }
};

Commands.mangatrack = {
	name: "mangatrack",
	help: "tbd",
	type: "weeb",
	lvl: 0,
	func: function(bot, msg, args) {
		var found = false;
		var pmfound = false;
		if (args.indexOf(" ") > 0 || args.indexOf("\u200B") > 0) {
			msg.channel.sendMessage("Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>'. Go to <http://mangastream.com/manga> to find a list.");
			return;
		}
		request(args, function(error, response, body) {
			if (error) {
				console.log(error);
				msg.channel.sendMessage("Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>'. Go to <http://mangastream.com/manga> to find a list.");
			}
			if (body.search("<p>We tried our best but couldn't find the page you're looking for. We moved things around in July of 2013 which resulted in a lot of URLs changing, sorry for the inconvenience! The following pages might help you find what you're looking for:</p>") == -1 && args.indexOf('mangastream.com') >= 0 ) {
				var temptag = args.substr(args.indexOf('/manga/')+7);
				var mangatag = 0
				if (temptag.indexOf('/') >= 0) {
					mangatag = temptag.slice(0, temptag.indexOf('/'))
					args = args.slice(0, args.indexOf('/manga/')+7+mangatag.length)
				} else {
					mangatag = temptag
				}
				if (body.search( '<a href="http://mangastream.com/r/' + mangatag + '/') !== -1) {
					var temp = ('http://mangastream.com/r/' + mangatag + '/').length
					var begin = body.search( 'http://mangastream.com/r/' + mangatag + '/') + temp
					var othertemp = body.substr(begin)
					var end = othertemp.indexOf("/")
					mangaDB.getAll().then(function(r) {
						if (r.length != 0) {
							for(i = 0; i < r.length; i++) {
								if (r[i].url == args && r[i].guild_id == msg.guild.id) {
									found = true;
									for(q = 0; q < r[i].pm_array.length; q++) {
										if (r[i].pm_array[q] == msg.author.id) {
											msg.channel.sendMessage("You are already tracking ``" + args + "``. All new chapters will continue to be linked to you in a PM.");
											pmfound = true
										}
										if (pmfound == false && q == r[i].pm_array.length-1 ) {
											mangaDB.addToPM(r[i]._id, msg.author);
											msg.channel.sendMessage("You are now tracking ``" + args + "``. All new chapters will be linked to you in a PM ✔");
										}
									}
								}
								if (found == false && i == r.length-1 ) {
									mangaDB.trackManga(args, body.substr(begin, end), 0, msg.guild.id, false);
									mangaDB.getAll().then(function(res) {
										for(j = 0; j < res.length; j++) {
											if (res[j].url == args && res[j].guild_id == msg.guild.id) {
												mangaDB.addToPM(res[j]._id, msg.author);
												msg.channel.sendMessage("You are now tracking ``" + args + "``. All new chapters will be linked to you in a PM ✔");
											}
										}
									})
								}
							}
						} else {
							mangaDB.trackManga(args, body.substr(begin, end), 0, msg.guild.id, false);
							mangaDB.getAll().then(function(res) {
								for(j = 0; j < res.length; j++) {
									if (res[j].url == args && res[j].guild_id == msg.guild.id) {
										mangaDB.addToPM(res[j]._id, msg.author);
										msg.channel.sendMessage("You are now tracking ``" + args + "``. All new chapters will be linked to you in a PM ✔");
									}
								}
							})
						}
					})
				} else {
					msg.channel.sendMessage("Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>' **MUST BE http NOT https**. Go to <http://mangastream.com/manga> to find a list.");
				}
			} else {
				msg.channel.sendMessage("Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>'. Go to <http://mangastream.com/manga> to find a list.");
			}
		})
	}
};

Commands.unmangatrack = {
	name: "unmangatrack",
	help: "tbd",
	type: "weeb",
	lvl: 3,
	func: function(bot, msg, args) {
		var found = false;
		var pmfound = false;
		if (args.indexOf(" ") > 0 || args.indexOf("\u200B") > 0) {
			msg.channel.sendMessage("Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>'. Go to <http://mangastream.com/manga> to find a list.");
			return;
		}
		request(args, function(error, response, body) {
			if (error) {
				console.log(error);
				msg.channel.sendMessage("Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>'. Go to <http://mangastream.com/manga> to find a list.");
			}
			if (body.search("<p>We tried our best but couldn't find the page you're looking for. We moved things around in July of 2013 which resulted in a lot of URLs changing, sorry for the inconvenience! The following pages might help you find what you're looking for:</p>") == -1 && args.indexOf('mangastream.com/manga') >= 0 ) {
				var temptag = args.substr(args.indexOf('/manga/')+7);
				var mangatag = 0
				if (temptag.indexOf('/') >= 0) {
					mangatag = temptag.slice(0, temptag.indexOf('/'))
					args = args.slice(0, args.indexOf('/manga/')+7+mangatag.length)
				} else {
					mangatag = temptag
				}
				if (body.search( '<a href="http://mangastream.com/r/' + mangatag + '/') !== -1) {
					var temp = ('http://mangastream.com/r/' + mangatag + '/').length
					var begin = body.search( 'http://mangastream.com/r/' + mangatag + '/') + temp
					var othertemp = body.substr(begin)
					var end = othertemp.indexOf("/")
					mangaDB.getAll().then(function(r) {
						if (r.length != 0) {
							for(i = 0; i < r.length; i++) {
								if (r[i].url == args && r[i].guild_id == msg.guild.id) {
									found = true;
									if (r[i].pm_array.length == 1 && r[i].mention == false) {
										mangaDB.deleteTrack(r[i]._id);
										msg.channel.sendMessage("You are now no longer tracking ``" + args + "`` ✔.");
									} else {
										for(q = 0; q < r[i].pm_array.length; q++) {
											if (r[i].pm_array[q] == msg.author.id) {
												mangaDB.removeFromPM(r[i]._id, msg.author);
												msg.channel.sendMessage("You are now no longer tracking ``" + args + "`` ✔");
												pmfound = true
											}
											if (pmfound == false && q == r[i].pm_array.length-1 ) {
												msg.channel.sendMessage("You are not tracking this manga.");
											}
										}
									}
								}
								if (found == false && i == r.length-1 ) {
									msg.channel.sendMessage("You were not tracking this manga.");
								}
							}
						} else {
							msg.channel.sendMessage("You are not tracking this manga.");
						}
					})
				} else {
					msg.channel.sendMessage("Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>' **MUST BE http NOT https**. Go to <http://mangastream.com/manga> to find a list.");
				}
			} else {
				msg.channel.sendMessage("Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>'. Go to <http://mangastream.com/manga> to find a list.");
			}
		})
  }
};

Commands.servermangatrack = {
	name: "mangatrack",
	help: "tbd",
	type: "weeb",
	lvl: 3,
	func: function(bot, msg, args) {
		if (args.indexOf(" ") > 0 || args.indexOf("\u200B") > 0) {
			msg.channel.sendMessage("Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>'. Go to <http://mangastream.com/manga> to find a list.");
			return;
		}
		request(args, function(error, response, body) {
			if (error) {
				console.log(error);
				msg.channel.sendMessage("Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>'. Go to <http://mangastream.com/manga> to find a list.");
			}
			if (body.search("<p>We tried our best but couldn't find the page you're looking for. We moved things around in July of 2013 which resulted in a lot of URLs changing, sorry for the inconvenience! The following pages might help you find what you're looking for:</p>") == -1 && args.indexOf('mangastream.com') >= 0 ) {
				var temptag = args.substr(args.indexOf('/manga/')+7);
				var mangatag = 0
				if (temptag.indexOf('/') >= 0) {
					mangatag = temptag.slice(0, temptag.indexOf('/'))
					args = args.slice(0, args.indexOf('/manga/')+7+mangatag.length)
				} else {
					mangatag = temptag
				}
				if (body.search( '<a href="http://mangastream.com/r/' + mangatag + '/') !== -1) {
					var found = false;
					var temp = ('http://mangastream.com/r/' + mangatag + '/').length
					var begin = body.search( 'http://mangastream.com/r/' + mangatag + '/') + temp
					var othertemp = body.substr(begin)
					var end = othertemp.indexOf("/")
					mangaDB.getAll().then(function(r) {
						if (r.length != 0) {
							for(i = 0; i < r.length; i++) {
								if (r[i].url == args && r[i].guild_id == msg.guild.id) {
									if (r[i].mention) {
										msg.channel.sendMessage("You are already tracking ``" + args + "`` in this server.");
									} else {
										mangaDB.updateChannel(r[i]._id, msg.channel.id);
										mangaDB.updateMention(r[i]._id, true);
										msg.channel.sendMessage("You are now tracking ``" + args + "``. All new chapters will be linked in this channel with an @ everyone ✔");
									}
									found = true
								}
								if (found == false && i == r.length-1 ) {
									mangaDB.trackManga(args, body.substr(begin, end), msg.channel.id, msg.guild.id, true);
									msg.channel.sendMessage("You are now tracking ``" + args + "``. All new chapters will be linked in this channel with an @ everyone ✔");
								}
							}
						} else {
							mangaDB.trackManga(args, body.substr(begin, end), msg.channel.id, msg.guild.id, true);
							msg.channel.sendMessage("You are now tracking ``" + args + "``. All new chapters will be linked in this channel with an @ everyone ✔");
						}
					})
				} else {
					msg.channel.sendMessage("Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>' **MUST BE http NOT https**. Go to <http://mangastream.com/manga> to find a list.");
				}
			} else {
				msg.channel.sendMessage("Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>'. Go to <http://mangastream.com/manga> to find a list.");
			}
		})
	}
};

Commands.unservermangatrack = {
	name: "mangatrack",
	help: "tbd",
	type: "weeb",
	lvl: 3,
	func: function(bot, msg, args) {
		if (args.indexOf(" ") > 0 || args.indexOf("\u200B") > 0) {
			msg.channel.sendMessage("Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>'. Go to <http://mangastream.com/manga> to find a list.");
			return;
		}
		request(args, function(error, response, body) {
			if (error) {
				console.log(error);
				msg.channel.sendMessage("Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>'. Go to <http://mangastream.com/manga> to find a list.");
			}
			if (body.search("<p>We tried our best but couldn't find the page you're looking for. We moved things around in July of 2013 which resulted in a lot of URLs changing, sorry for the inconvenience! The following pages might help you find what you're looking for:</p>") == -1 && args.indexOf('mangastream.com') >= 0 ) {
				var temptag = args.substr(args.indexOf('/manga/')+7);
				var mangatag = 0
				if (temptag.indexOf('/') >= 0) {
					mangatag = temptag.slice(0, temptag.indexOf('/'))
					args = args.slice(0, args.indexOf('/manga/')+7+mangatag.length)
				} else {
					mangatag = temptag
				}
				if (body.search( '<a href="http://mangastream.com/r/' + mangatag + '/') !== -1) {
					var found = false;
					var temp = ('http://mangastream.com/r/' + mangatag + '/').length
					var begin = body.search( 'http://mangastream.com/r/' + mangatag + '/') + temp
					var othertemp = body.substr(begin)
					var end = othertemp.indexOf("/")
					mangaDB.getAll().then(function(r) {
						if (r.length != 0) {
							for(i = 0; i < r.length; i++) {
								if (r[i].url == args && r[i].guild_id == msg.guild.id) {
									if (r[i].mention) {
										if (r[i].pm_array.length < 1) {
											mangaDB.deleteTrack(r[i]._id);
										} else {
											mangaDB.updateChannel(r[i]._id, 0);
											mangaDB.updateMention(r[i]._id, false);
										}
										msg.channel.sendMessage("You are now no longer tracking ``" + args + "`` in this server ✔");
									} else {
										msg.channel.sendMessage("You are already not tracking ``" + args + "`` in this server.");
									}
									found = true
								}
								if (found == false && i == r.length-1 ) {
									msg.channel.sendMessage("You are already not tracking ``" + args + "`` in this server.");
								}
							}
						} else {
							msg.channel.sendMessage("You are already not tracking ``" + args + "`` in this server.");
						}
					})
				} else {
					msg.channel.sendMessage("Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>' **MUST BE http NOT https** . Go to <http://mangastream.com/manga> to find a list.");
				}
			} else {
				msg.channel.sendMessage("Syntax error: Not a valid mangastream link. Please give the link in the form of '<http://mangastream.com/manga/><manga name>'. Go to <http://mangastream.com/manga> to find a list.");
			}
		})
	}
};

Commands.createcommand = {
	name: "createcommand",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args) {
		var comexists = false
		var specific_lvl = 0;
		if (!args) {
			msg.channel.sendMessage("Syntax error. Correct usage: '!createcommand <command name> | <command text> ---<permission level>'. Command name cannot contain spaces. (permission level can be ommitted but the command will be usable by anyone)");
			return;
		}
		if (args.indexOf(" | ") < 0) {
			msg.channel.sendMessage("Syntax error. Correct usage: '!createcommand <command name> | <command text> ---<permission level>'. Command name cannot contain spaces. (permission level can be ommitted but the command will be usable by anyone)");
			return;
		}
		if (/---[0-3]|---6/.test(args)) {
			if (/---[0-3]|---6/.exec(args).index !== args.length-4) {
				msg.channel.sendMessage("Syntax error. Correct usage: '!createcommand <command name> | <command text> ---<permission level>'. Command name cannot contain spaces. (permission level can be ommitted but the command will be usable by anyone)");
				return;
			} else {
				specific_lvl = args.substr(/---[0-3]|---6/.exec(args).index+3, 1);
			}
		}
		var tempname = args.split(" ")[0].trim();
		var comname = args.split(" ")[0].toLowerCase().trim();
		if (args.split(" ")[1] != "|") {
			msg.channel.sendMessage("```diff\n- Command name cannot contain spaces.```");
			return;
		}
		var comcontent = args.replace(tempname + " | ", "").replace("---" + specific_lvl, "").trim();
		if (Commands[comname]) {
			msg.channel.sendMessage("```diff\n- Cannot overwrite core bot commands.```");
			return;
		}
		customcommands.getAllHere(msg.guild).then(function(r) {
			for (i = 0; i < r.length; i++) {
				if (r[i].name === comname) {
				 comexists = true
				}
			}
			if (comexists) {
				customcommands.deleteCommand(msg.guild, comname);
				customcommands.createNewCommand(comname, msg.guild, comcontent, specific_lvl);
				msg.channel.sendMessage("📝 Command `" + comname + "` has been overwritten with new response: " + comcontent);
			}	else {
				customcommands.createNewCommand(comname, msg.guild, comcontent, specific_lvl);
				msg.channel.sendMessage("📝 Command `" + comname + "` has been created with response: " + comcontent);
			}
		});
	}
};

Commands.deletecommand = {
	name: "deletecommand",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args) {
		if (!args) {
			msg.channel.sendMessage("Syntax error. Correct usage: '!delete <command name>. Command name cannot contain spaces.");
			return;
		}
		customcommands.deleteCommand(msg.guild, args).then(function(r) {
			msg.channel.sendMessage(r)
		}).catch(function(e) {
			msg.channel.sendMessage(e)
		})
	}
};

Commands.eval = {
	name: "eval",
	help: "tbd",
	type: "admin",
	lvl: 6,
	func: function(bot, msg, args) {
		if (msg.author.id == 159704938283401216) {
			try {
	        msg.channel.sendMessage(eval(args));
	    }
	    catch (err) {
	        msg.channel.sendMessage("Eval failed :(");
	        msg.channel.sendMessage("`" + err + "`");
	    }
		}
  }
};

Commands.nsfw = {
	name: "nsfw",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args) {
		guildDB.nsfwChannel(msg.channel).then(function(r) {
			msg.reply(r);
		}).catch(function(e) {
			msg.reply(e);
		})
  }
};

Commands.unnsfw = {
	name: "unnsfw",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args) {
		guildDB.unNSFWChannel(msg.channel).then(function(r) {
			msg.reply(r);
		}).catch(function(e) {
			msg.reply(e);
		})
  }
};

Commands.rule34 = {
	name: "rule34",
	help: "tbd",
	type: "nsfw",
	lvl: 0,
	func: function(bot, msg, args) {
		request('http://rule34.xxx//index.php?page=dapi&s=post&q=index&limit=300&tags=' + args, function (error, response, body) {
		    if (!error && response.statusCode == 200) {
					if (body.length < 1) {
						msg.channel.sendMessage("Sorry, nothing found.");
						return;
					}
					if (args.length < 1) {
						args = "<no tags specified>";
					}
		      parseString(body, function (err, result) {
						msg.channel.sendMessage("You've searched for `" + args + "`. Sending 3 random images from a potential 300 results...").then(mesg => {
							msg.channel.sendMessage('http:' + result.posts.post[Math.floor((Math.random() * result.posts.post.length))].$.file_url);
							msg.channel.sendMessage('http:' + result.posts.post[Math.floor((Math.random() * result.posts.post.length))].$.file_url);
							msg.channel.sendMessage('http:' + result.posts.post[Math.floor((Math.random() * result.posts.post.length))].$.file_url);
						});
		      });
		    }
		})
  }
};

Commands.konachan = {
	name: "konachan",
	help: "tbd",
	type: "nsfw",
	lvl: 0,
	func: function(bot, msg, args) {
		if (args.split(" ").length > 5) {
			msg.channel.sendMessage("Konachan only supports upto 6 tags.");
			return;
		}
		request('https://konachan.net/post/index.json?limit=300&tags=' + args, function (error, response, body) {
		    if (!error && response.statusCode == 200) {
					var result = JSON.parse(body);
					if (result.length < 1) {
						msg.channel.sendMessage("Sorry, nothing found.");
						return;
					}
					if (args.length < 1) {
						args = "<no tags specified>";
					}
					if ((args.toString().toLowerCase().indexOf("gaping") > -1
						|| args.toString().toLowerCase().indexOf("gape") > -1)
						|| args.toString().toLowerCase().indexOf("prolapse") > -1
						|| args.toString().toLowerCase().indexOf("toddlercon") > -1
						|| args.toString().toLowerCase().indexOf("scat") > -1
						|| args.toString().toLowerCase().indexOf("gore") > -1) {
							msg.channel.sendMessage("You've searched for `" + args + "`. Sending images in a pm...").then(mesg => {
								msg.author.sendMessage(result[Math.floor((Math.random() * result.length))].file_url);
								msg.author.sendMessage(result[Math.floor((Math.random() * result.length))].file_url);
								msg.author.sendMessage(result[Math.floor((Math.random() * result.length))].file_url);
							});
					} else {
							msg.channel.sendMessage("You've searched for `" + args + "`. Sending 3 random images from a potential 300 results...").then(mesg => {
								msg.channel.sendMessage(result[Math.floor((Math.random() * result.length))].file_url);
								msg.channel.sendMessage(result[Math.floor((Math.random() * result.length))].file_url);
								msg.channel.sendMessage(result[Math.floor((Math.random() * result.length))].file_url);
							});
					}
		    }
		  })
  }
};

Commands.danbooru = {
	name: "danbooru",
	help: "tbd",
	type: "nsfw",
	lvl: 0,
	func: function(bot, msg, args) {
		if (args.split(" ").length > 2) {
			msg.channel.sendMessage("Danbooru only supports upto 2 tags.");
			return;
		}
		request('https://danbooru.donmai.us/posts.json?limit=300&tags=' + args, function (error, response, body) {
		    if (!error && response.statusCode == 200) {
					var result = JSON.parse(body);
					if (result.length < 1) {
						msg.channel.sendMessage("Sorry, nothing found.");
						return;
					}
					if (args.length < 1) {
						args = "<no tags specified>";
					}
					if ((args.toString().toLowerCase().indexOf("gaping") > -1
						|| args.toString().toLowerCase().indexOf("gape") > -1)
						|| args.toString().toLowerCase().indexOf("prolapse") > -1
						|| args.toString().toLowerCase().indexOf("toddlercon") > -1
						|| args.toString().toLowerCase().indexOf("scat") > -1
						|| args.toString().toLowerCase().indexOf("gore") > -1) {
							msg.channel.sendMessage("You've searched for `" + args + "`. Sending images in a pm...").then(mesg => {
								msg.author.sendMessage('https://danbooru.donmai.us' + result[Math.floor((Math.random() * result.length))].file_url);
								msg.author.sendMessage('https://danbooru.donmai.us' + result[Math.floor((Math.random() * result.length))].file_url);
								msg.author.sendMessage('https://danbooru.donmai.us' + result[Math.floor((Math.random() * result.length))].file_url);
							});
					} else {
							msg.channel.sendMessage("You've searched for `" + args + "`. Sending 3 random images from a potential 300 results...").then(mesg =>  {
								msg.channel.sendMessage('https://danbooru.donmai.us' + result[Math.floor((Math.random() * result.length))].file_url);
								msg.channel.sendMessage('https://danbooru.donmai.us' + result[Math.floor((Math.random() * result.length))].file_url);
								msg.channel.sendMessage('https://danbooru.donmai.us' + result[Math.floor((Math.random() * result.length))].file_url);
							});
					}
		    }
		  })
  }
};

Commands.yandere = {
	name: "yandere",
	help: "tbd",
	type: "nsfw",
	lvl: 0,
	func: function(bot, msg, args) {
		request('https://yande.re/post/index.json?limit=500&tags=' + args, function (error, response, body) {
		    if (!error && response.statusCode == 200) {
					var result = JSON.parse(body);
					if (result.length < 1) {
						msg.channel.sendMessage("Sorry, nothing found.");
						return;
					}
					if (args.length < 1) {
						args = "<no tags specified>";
					}
					if ((args.toString().toLowerCase().indexOf("gaping") > -1
						|| args.toString().toLowerCase().indexOf("gape") > -1)
						|| args.toString().toLowerCase().indexOf("prolapse") > -1
						|| args.toString().toLowerCase().indexOf("toddlercon") > -1
						|| args.toString().toLowerCase().indexOf("scat") > -1
						|| args.toString().toLowerCase().indexOf("gore") > -1) {
							msg.channel.sendMessage("You've searched for `" + args + "`. Sending images in a pm...").then(mesg => {
								msg.author.sendMessage(result[Math.floor((Math.random() * result.length))].file_url);
								msg.author.sendMessage(result[Math.floor((Math.random() * result.length))].file_url);
								msg.author.sendMessage(result[Math.floor((Math.random() * result.length))].file_url);
							});
					} else {
							msg.channel.sendMessage("You've searched for `" + args + "`. Sending 3 random images from a potential 300 results...", function(err, mesg) {
								msg.channel.sendMessage(result[Math.floor((Math.random() * result.length))].file_url);
								msg.channel.sendMessage(result[Math.floor((Math.random() * result.length))].file_url);
								msg.channel.sendMessage(result[Math.floor((Math.random() * result.length))].file_url);
							});
					}
		    }
		  })
  }
};

Commands.reddit = {
	name: "reddit",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args) {
		var found = false;
		if (args.indexOf(" ") > 0 || args.indexOf("\u200B") > 0) {
			msg.channel.sendMessage("Syntax error: Not a valid subreddit link. Please give the link in the form of '<https://www.reddit.com/r/><subreddit name>'.");
			return;
		}
		request(args, function(error, response, body) {
			if (error) {
				console.log(error);
				msg.channel.sendMessage("Syntax error: Not a valid subreddit link. Please give the link in the form of '<https://www.www.reddit.com/r/><subreddit name>'.");
			}
			if (body.search('<p id="noresults" class="error">there doesn' + "'" + 't seem to be anything here</p>') == -1 && body.search('<h3>You must be a Reddit Gold member to view this super secret community</h3>') == -1 && body.search('<h3>This community has been banned</h3>') == -1 && args.indexOf('www.reddit.com/r/') >= 0 ) {
				temp = args.substr(args.indexOf('/r/')+3);
				if (temp.indexOf("/") >= 0) {
					name = temp.slice(0, temp.indexOf('/'));
				} else {
					name = temp;
				}
				if (name.toLowerCase() == 'all' || name.toLowerCase() == 'mod' || name.toLowerCase() == 'friends' || name.toLowerCase() == 'dashboard' || name.toLowerCase() == '' || name.toLowerCase() == 'random') {
					msg.channel.sendMessage("nono <3");
					return;
				}
				redditDB.getAll().then(function(r) {
					if (r.length < 1) {
						redditDB.trackSubreddit(name, msg);
						bot.sendMessage(msg.channel, "/r/" + name + ` Is now being tracked in <#${msg.channel.id}>. All new posts will be sent as messages here.`);
					} else {
						for (i = 0; i < r.length; i++) {
							if (r[i].channel_id == msg.channel.id && r[i].subreddit_name == name) {
									msg.channel.sendMessage("You are already tracking /r/" + name + ` in <#${msg.channel.id}>. All new posts are sent as messages here.`);
									found = true
							}
							if (found == false && i == r.length-1) {
								redditDB.trackSubreddit(name, msg);
								msg.channel.sendMessage("/r/" + name + ` Is now being tracked in <#${msg.channel.id}>. All new posts will be sent as messages here.`);
							}
						}
					}
				})
			} else {
				msg.channel.sendMessage("Syntax error: Not a valid subreddit link. Please give the link in the form of '<https://www.www.reddit.com/r/><subreddit name>'.");
			}
		})
  }
};

Commands.unreddit = {
	name: "unreddit",
	help: "tbd",
	type: "admin",
	lvl: 3,
	func: function(bot, msg, args) {
		var found = false;
		if (args.indexOf(" ") > 0 || args.indexOf("\u200B") > 0) {
			msg.channel.sendMessage("Syntax error: Not a valid subreddit link. Please give the link in the form of 'reddit.com/r/<subreddit name>'.");
			return;
		}
		request(args, function(error, response, body) {
			if (error) {
				console.log(error);
				msg.channel.sendMessage("Syntax error: Not a valid subreddit link. Please give the link in the form of 'www.reddit.com/r/<subreddit name>'.");
			}
			if (body.search('<p id="noresults" class="error">there doesn' + "'" + 't seem to be anything here</p>') == -1 && args.indexOf('www.reddit.com/r/') >= 0 ) {
				temp = args.substr(args.indexOf('/r/')+3);
				if (temp.indexOf("/") >= 0) {
					name = temp.slice(0, temp.indexOf('/'));
				} else {
					name = temp;
				}
				redditDB.getAll().then(function(r) {
					if (r.length < 1) {
						redditDB.trackSubreddit(name, msg);
						bot.sendMessage(msg.channel, `/r/` + name + ` was not being tracked in <#${msg.channel.id}> to begin with.`);
					} else {
						for (i = 0; i < r.length; i++) {
							if (r[i].channel_id == msg.channel.id && r[i].subreddit_name == name) {
									redditDB.deleteTrack(msg.guild, name);
									msg.channel.sendMessage(`/r/` + name + ` Is now not being tracked in <#${msg.channel.id}>`);
									found = true
							}
							if (found == false && i == r.length-1) {
								msg.channel.sendMessage(`/r/` + name + ` was not being tracked in <#${msg.channel.id}> to begin with.`);
							}
						}
					}
				})
			} else {
				msg.channel.sendMessage("Syntax error: Not a valid subreddit link. Please give the link in the form of 'www.reddit.com/r/<subreddit name>'.");
			}
		})
  }
};

Commands["8ball"] = {
	name: "8ball",
	help: "tbd",
	type: "general",
	lvl: 0,
	func: function(bot, msg, args) {
		var response = [];
		response.push('```diff\n+ It is certain```');
		response.push('```diff\n+ It is decidedly so```');
		response.push('```diff\n+ Without a doubt```');
		response.push('```diff\n+ Yes, definitely```');
		response.push('```diff\n+ You may rely on it```');
		response.push('```diff\n+ As I see it, yes```');
		response.push('```diff\n+ Most likely```');
		response.push('```diff\n+ Outlook good```');
		response.push('```diff\n+ Yes```');
		response.push('```diff\n+ Signs point to yes```');
		response.push('```fix\nReply hazy try again```');
		response.push('```fix\nAsk again later```');
		response.push('```fix\nBetter not tell you now```');
		response.push('```fix\nCannot predict now```');
		response.push('```fix\nConcentrate and ask again```');
		response.push("```diff\n- Don't count on it```");
		response.push('```diff\n- My reply is no```');
		response.push('```diff\n- My sources say no```');
		response.push('```diff\n- Outlook not so good```');
		response.push('```diff\n- Very doubtful```');

		var msgArray = [];
		msgArray.push(':8ball: *"' + args +  '"* :8ball:');
		var responsenum = Math.floor((Math.random())*20)
		msgArray.push(response[responsenum]);
		msg.channel.sendMessage(msgArray);

  }
};

Commands.dice = {
	name: "dice",
	help: "tbd",
	type: "general",
	lvl: 0,
	func: function(bot, msg, args) {
		if (args) {
      dice = args
    } else {
      dice = 'd6'
    }
		request('https://rolz.org/api/?' + dice + '.json', function (error, response, body) {
			if (!error && response.statusCode === 200) {
        try {
          JSON.parse(body)
        } catch (e) {
          msg.channel.sendMessage('```diff\n- The API returned an unexpected response.\n```')
          return
        }
        var result = JSON.parse(body)
        msg.reply(' :game_die: ``' + result.input + '`` rolled and the result was... `` ' + result.result + ' ' + result.details + ' ``:game_die:')
			}
		})
  }
};

Commands.rip = {
	name: "rip",
	help: "tbd",
	type: "general",
	lvl: 0,
	func: function(bot, msg, args) {
		var url = ""
		if (msg.mentions.users.array().length > 0) {
			url = msg.mentions.users.array()[0].avatarURL
		} else {
			url = msg.author.avatarURL
		}
		if (url == null) {
			msg.reply("Sorry, you need a profile picture to use this command.")
			return;
		} else {
			jimp.read('./runtime/jimprepo/grave' + Math.floor(Math.random()*4) + '.png', function (err, image) {
				jimp.read(url, function (err, avatar) {
					avatar.resize(90, 90).sepia().opacity(0.5);
					image.composite(avatar, 100, 68);
					var path = './runtime/jimprepo/gravepic.png'
					image.write(path, function(err) {
						msg.channel.sendFile(path)
					})
				})
			});
		}
  }
};

Commands.triggered = {
	name: "triggered",
	help: "tbd",
	type: "general",
	lvl: 0,
	func: function(bot, msg, args) {
		var url = ""
		if (msg.mentions.users.array().length > 0) {
			url = msg.mentions.users.array()[0].avatarURL
		} else {
			url = msg.author.avatarURL
		}
		if (url == null) {
			msg.reply("Sorry, you need a profile picture to use this command.")
			return;
		} else {
			jimp.read(url, function (err, avatar) {
				jimp.read('./runtime/jimprepo/triggered.png', function (err, triggered) {
					avatar.resize(150, 150);
					triggered.resize(150, jimp.AUTO);
					avatar.composite(triggered, 0, 123);
					var path = './runtime/jimprepo/trigpic.png'
					avatar.write(path, function(err) {
						msg.channel.sendFile(path)
					})
				})
			});
		}
  }
};

// Commands.battle = {
// 	name: "battle",
// 	help: "tbd",
// 	type: "rpg",
// 	lvl: 0,
// 	func: function(bot, msg, args) {
// 		battleDB.getBattleRecord(msg.author, msg.server).then(function(r) {
//
// 		}).catch(function(e) {
// 			if (e == 'No battle record found') {
// 				battleDB.createNewBattle(msg.author, msg.server);
// 				battleDB.getBattleRecord(msg.author, msg.server).then(function(r) {
//
// 				}
// 			}
// 		})
//
//
//
//
//
//
//
//
//   }
// };

exports.Commands = Commands;
