# Pro Football 2.0 - 2021 Revision

## About
When I was a kid one of my prized possessions was a 1978 handheld Matell Pro Football 2. It had originally been my dad's but he had passed it down to me when once I was old enough to appreciate it. It was a deceptively simple approximation of football that included running, passing, interceptions and kicking. I spent many, many hours with that thing. Recently I got a hankering to play it once again but to my dismay could not find it anywhere. I then checked ebay and Amazon to see if I could find one. However they cost more than I was wiling to pay just to experience a little nostalgia. If I could not find my copy and could not afford to buy another copy I decided to do the next best thing, recreate the game in JavaScript!

![This is where an GIF should be. Sorry you can't see it. Try using Chrome](media/gameplay.gif "Pro Football 2.0 gameplay")

## Usage notes:
I have tried to make this game faithful to the original while also providing some improvements in game play. The wide receiver now runs real routes like streaks, deep crosses, drags and curls. I have tried to make defenders behave more like their real life counter points. Defensive linemen have a slow movement speed and a smaller range while defensive backs have a faster movement speed and a wider coverage radius. The linebacker moves at a random time to try to intercept passes. I have added advanced statistics tracking and keep track of the all time high scores as well. Please note this game requires use of a keyboard. Further information about gameplay is provided by clicking the "How to Play" button in game.

The game has been a hit at the office and I hope you will enjoy it too!

## December 2021 Update
After setting this code aside for five years I decided to come back to it and try to make it better. It is now quite different from the original handheld version. There are now 4 different games modes based on the size of the field. The modes have different numbers of defenders, different defenses, different numbers of receivers and different opponent AI. The pathfinding algorithm has been improved. The field goal animation has been completed. There were a number bugs in my original version but those have been fixed. The game was given a visual facelift and many improvements were made to help it be more enjoyable.

Under the hood, the game no longer uses requireJS and instead makes use of native es6 classes. I'm a self taught programer and am not a game designer by trade. It was a lot of fun stretching my abilities and creating something I could share with my friends. If you are reading this I hope you will enjoy this game and have fun playing it.

[Play now!](https://nhaney90.github.io/football-test/index.html)

## Libraries used:
JavaScript, jQuery and Bootstrap

## Future Improvements
This is not a completed project and I honestly may never finish it. The following are a list of improvements I would like to make:
* Add sound effects for field goals, sacks, kickoffs, touchdowns and receptions
* Create field goal posts and stadium seats using Canvas
* Add a touchdown banner and message

Do you have an improvement you would like to see? Let me know!

## Known Bugs
* None! Thanks to my friends for helping me play test

Have you spotted a bug? Open an issue!

![This is where an image should be. Sorry you can't see it. Try using Chrome](media/image.jpg "Original Mattel Pro Football")

