% Modules

:- use_module(library(random)).
:- use_module(library(lists)).
:- use_module(library(system)).
:- now(Timestamp),
   setrand(Timestamp).

:- ensure_loaded('ai.pl').
:- ensure_loaded('utils.pl').
:- ensure_loaded('menus.pl').
:- ensure_loaded('cli.pl').
:- ensure_loaded('constants.pl').
:- ensure_loaded('board.pl').
:- ensure_loaded('game.pl').
:- ensure_loaded('plays.pl').
:- ensure_loaded('cell.pl').
:- ensure_loaded('visualization.pl').
:- ensure_loaded('test.pl').

% Main

count_xpieces_line(_, [], 0).
count_xpieces_line(Xpiece, [Cell | T], N) :-
        cell_xpiece(Cell, Xpiece),
        count_xpieces_line(Xpiece, T, N1),
        N is N1 + 1.
count_xpieces_line(Xpiece, [Cell | T], N) :-
        cell_xpiece(Cell, X2),
        Xpiece \= X2,
        count_xpieces_line(Xpiece, T, N).
count_xpieces(_, [], 0).
count_xpieces(Xpiece, [Line | T], N) :-
        count_xpieces_line(Xpiece, Line, N1),
        count_xpieces(Xpiece, T, N2),
        N is N1 + N2.

play :- show_intro.

play_1vbot(Game, _) :- 
        game_ended(Game), !,
        print_game(Game),
        game_winner(Game, Winner),
        show_end_game(Winner).

play_1vbot(Game, Preds) :-
        print_game(Game),
        game_player(Game, Player),
        nth1(Player, Preds, MovePred),
        Play =.. [MovePred, Game, Game1],
        Play,
        end_play(Game1, New_game),
        play_1vbot(New_game, Preds).

play_1v1(Game) :- 
        game_ended(Game), !,
        game_board(Game, Board),
        print_board(Board),
        game_winner(Game, Winner),
        show_end_game(Winner).
        
play_1v1(Game) :-
        print_game(Game),
        make_play(Game, Game1),
        end_play(Game1, New_game),
        play_1v1(New_game).

play_botvbot(Game) :- 
        game_ended(Game), !,
        game_board(Game, Board),
        print_board(Board),
        game_winner(Game, Winner),
        show_end_game(Winner).
        
play_botvbot(Game) :-
        print_game(Game),
        make_play_bot(Game, Game1),
        end_play(Game1, New_game),
        play_botvbot(New_game).

make_play_joker(Game, New_game) :-
        game_board(Game, Board),
        num_jokers_to_place(Board, Jokers),
        ask_for_jokers(Jokers),
        read_coords(Coords),
        place_xpiece(Game, Coords, New_game1), !,
        game_next_player(New_game1, New_game).

make_play_joker(Game, New_game) :-
        write('Invalid location! Please try again.'), nl,
        make_play_joker(Game, New_game).

make_play_bot_return(Game, New_game, Move) :-
        game_difficulty(Game, 1),
        ai_bot_random(available_moves, Game, Move),
        place_xpiece(Game, Move, New_game).

make_play_bot_return(Game, New_game, Move) :-
        game_difficulty(Game, 2),
        ai_bot_greedy(available_moves, place_xpiece, game_value, Game, Move),
        place_xpiece(Game, Move, New_game).

make_play_bot_return(Game, New_game, Move) :-
        game_difficulty(Game, 3),
        ai_bot_greedy(available_moves, place_xpiece, game_value, Game, Move),
        place_xpiece(Game, Move, New_game).

make_play_bot(Game, New_game) :-
        game_difficulty(Game, 1),
        ai_bot_random(available_moves, Game, Move),
        write('Bot played in position '), write(Move), nl,
        place_xpiece(Game, Move, New_game).

make_play_bot(Game, New_game) :-
        game_difficulty(Game, 2),
        ai_bot_greedy(available_moves, place_xpiece, game_value, Game, Move),
        write('Bot played in position '), write(Move), nl,
        place_xpiece(Game, Move, New_game).

make_play(Game, New_game) :-
        game_board(Game, Board),
        num_jokers_to_place(Board, Jokers),
        Jokers > 0, !,
        make_play_joker(Game, New_game).

make_play(Game, New_game) :-
        game_player(Game, Player),
        write('Player '), write(Player), write(', please choose a location to place the X.'), nl,
        read_coords(Coords),
        place_xpiece(Game, Coords, New_game), !.

make_play(Game, New_game) :-
        write('Invalid location! Please try again.'), nl,
        make_play(Game, New_game).

end_play(Game, New_game) :-
        check_patterns(Game, New_scores),
        convert_patterns_to_score(Game, New_scores, Game1),
        game_update_scores(Game1, Game2),
        game_next_player(Game2, New_game).
        
        
read_coords([X, Y]) :-
        write('X? '),
        cli_get_digit(X),
        write('Y? '),
        cli_get_digit(Y).
