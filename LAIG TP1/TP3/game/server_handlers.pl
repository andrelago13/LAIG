:- ensure_loaded('modx.pl').

% default inputs
parse_input(handshake, handshake).
parse_input(test(C,N), Res) :- test(C,Res,N).
parse_input(quit, goodbye).

parse_input(start_game(X,Y), Game) :- start_game(Game, X, Y).

parse_input(make_play(Game), [Game, []]) :-        % BOT PLAY
        game_ended(Game).
parse_input(make_play(Game), [NewGame, Move]) :-
        make_play_bot_return(Game, Game1, Move),
        end_play(Game1, NewGame).

parse_input(make_play(Game, X, Y), NewGame) :-          % XPIECE PLAY
        place_xpiece(Game, [X, Y], Game1),
        game_board(Game1, Board),
        num_jokers_to_place(Board, NumJokers),
        xpiece_play_end(Game1, NumJokers, NewGame).
xpiece_play_end(Game, 0, NewGame) :-
        end_play(Game, NewGame).
xpiece_play_end(Game, N, Game) :- N > 0.

parse_input(num_jokers_to_place(Game), N) :-
        game_board(Game, Board),
        num_jokers_to_place(Board, N).

parse_input(available_moves(Game), Moves) :- available_moves(Game, Moves).

parse_input(game_ended(Game), yes) :- game_ended(Game), !.
parse_input(game_ended(_), no).
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%                                       Commands                                                  %%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

test(_,[],N) :- N =< 0.
test(A,[A|Bs],N) :- N1 is N-1, test(A,Bs,N1).