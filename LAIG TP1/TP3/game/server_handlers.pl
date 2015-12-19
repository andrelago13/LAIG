:- ensure_loaded('modx.pl').

% default inputs
parse_input(handshake, handshake).
parse_input(test(C,N), Res) :- test(C,Res,N).
parse_input(quit, goodbye).

parse_input(start_game(X,Y), Game) :- start_game(Game, X, Y).
parse_input(start_game(_,_), error_starting_game).
parse_input(make_play(Game, X, Y), NewGame) :-
        place_xpiece(Game, [X, Y], Game1),
        end_play(Game1, NewGame).
parse_input(make_play(_, _, _), error_invalid_piece).
parse_input(num_jokers_to_place(Game), N) :-
        game_board(Game, Board),
        num_jokers_to_place(Board, N).
parse_input(available_moves(Game), Moves) :- available_moves(Game, Moves).
parse_input(available_moves(_), error).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%                                       Commands                                                  %%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

test(_,[],N) :- N =< 0.
test(A,[A|Bs],N) :- N1 is N-1, test(A,Bs,N1).