# LAIG

Set of 3 projects developed for the "Laboratory of Applications And Graphic Interfaces" (LAIG) course of the Integrated Master's in Informatics and Computer Engineering of the Faculty Of Engineering of the University of Porto.

The first project is a XML Parser that allows reading 3d scenes from a XML file with a specific syntax. After reading, the parser initializes the 3d objects to create the scene as specified.

The second project extends the XML syntax used, allowing the creation of animations, curve sufaces and modified shaders.

The third and last project was the main project of the course. The objective was to develop a graphical interface for a [Prolog game we developed earlier in another course](https://github.com/gtugablue/PLOG-MOD-X). Some of the functionalities implemented are:
- 1P, 2P or BOT vs. BOT modes
- Undo plays
- Game movie
- Camera position switching (not free roam, rather a set of pre-defined positions)
- Scenario changing
- Multiple animations both for plays and camera position changing

The following section describes the installation and usage details of the third project (MOD X).

## MOD X
### Game setup
To start the game, there are two things you need to use: the Prolog server and the
javascript application.

To setup the Prolog server, use SICStus Prolog to consult the file
“ModX/game/server.pl”. Then, invoke the predicate “server” by writing “server.” in SICStus’s
command line. Do not close SICStus while playing the game.

To start the game, upload the project to a web server (or use it locally) and open
“ModX/reader/index.html” in your browser. Then you can start the game. If the browser is
unable to reach the Prolog server for some reason an error message will be shown.

### Game rules
ModX is a turn based puzzle game, in which the objective is for each player to create
patterns using X-pieces of either his color or transparent color (also called Jokers). Patterns can
be 5 inline pieces (either vertically, horizontally or diagonally aligned) or a cross (either “+” or
“X”, with a total of 5 pieces each). It is also possible to make multiple patterns simultaneously.

When a player makes a pattern, all the X-pieces that are used in it are removed from the
board, being replaced by base pieces of the color of the scoring player. If any Joker is used in the
pattern, the scoring player must then put it in the board again, in any position that does not
create a new pattern.

Each player’s score is calculated by the amount of base pieces of his color on top of every
board cell (since it is possible to perform patterns on top of base pieces, only the top base pieces
are considered for keeping scores). The game is terminated when either player runs out of Xpieces,
one player reaches the defined score limit or one player runs out of time to make a play.
Both the score limit and time limit for each play are defined when the game starts.

### User instructions
When at the starting menu, the user must use the interface on the top-right corner to
choose how he wants to play the game. This interface allows the user to change the game
scenario, toggle lights and automatic camera switching (when activated, the view perspective is
automatically changed according to the current player). It also allows the user to choose the
game mode (2 players, vs. CPU easy, vs. CPU hard, CPU vs. CPU), score limit, play time limit and
start the game. Once the game is started, each user must place his pieces turn by turn by
hovering the mouse over the board and selecting a position with the left mouse button. This 
triggers an animation to place the piece and switch to the other players perspective. If a pattern
is made, the game replaces all the X-pieces for bases and then the user must place any jokers
remaining using the mouse. During the game, the interface allows for manual camera position
changing (player 1, player 2 and top) and allows any player to undo a play (except on BOT vs.
BOT). Also, the interface allows the user to end the game at any time.

Also, during the game, a scoreboard is visible on the top-left corner, showing each
player’s scores and the time left for the current play.

When the game is ended, the game switches to a screen similar to the initial menu,
where it shows why the game has ended and who the winner is. At this screen, the interface on
the top-right corner allows the user to start a new game or to see the last game’s movie.

During the game movie, the user can see the sequence of plays that occurred during
that game, and he can also terminate the movie at any time using the interface.
