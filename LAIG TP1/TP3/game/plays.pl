% Plays

%place_xpiece(+Game, +Coords, -New_game)
% Places a normal piece or a joker.
place_xpiece(Game, Coords, New_game):-
        nth0(0, Coords, X),
        nth0(1, Coords, Y),
        X >= 0, X < 8, Y >= 0, Y < 8,
        game_board(Game, Board),
        num_jokers_to_place(Board, 0), !,
        game_player(Game, Player),
        board_xy(Board, Coords, Cell),
        cell_xpiece(Cell, -1),
        cell_spieces(Cell, Spieces),
        cell_spieces(New_cell, Spieces),
        cell_xpiece(New_cell, Player),
        board_set_cell(Board, Coords, New_cell, New_board),
        game_dec_player_num_xpieces(Game, Player, Game1),
        game_set_board(Game1, New_board, New_game).
place_xpiece(Game, Coords, New_game) :-
        place_joker(Game, Coords, New_game).

%place_joker(+Game, +Coords, -New_game)
place_joker(Game, Coords, New_game) :-
        game_board(Game, Board),
        board_xy(Board, Coords, Cell),
        cell_xpiece(Cell, -1),
        cell_spieces(Cell, Spieces),
        cell_spieces(New_cell, Spieces),
        cell_xpiece(New_cell, 0),
        board_set_cell(Board, Coords, New_cell, New_board),
        game_set_board(Game, New_board, New_game),
        check_patterns(New_game, []).

%available_moves(+Game, -Moves)
% Lists all possible places where a piece can be placed acording to the current Game state.
available_moves(Game, Moves) :-
        game_board(Game, Board),
        length(Board, Height),
        length(Board, Width),
        Height1 is Height - 1,
        Width1 is Width - 1,
        available_moves_aux(Game, Width1, Height1, Board, [], Moves).
available_moves_aux(_, _, -1, _, Moves, Moves) :- !.
available_moves_aux(Game, Width, Height, Board, Moves, New_moves) :-
        available_moves_aux_aux(Game, Width, Height, Board, Moves, Moves1),
        Height1 is Height - 1,
        available_moves_aux(Game, Width, Height1, Board, Moves1, New_moves).
available_moves_aux_aux(_, -1, _, _, Moves, Moves) :- !.
available_moves_aux_aux(Game, Width, Height, Board, Moves, New_moves) :-
        Coords = [Width, Height],
        available_moves_coords(Game, Coords, Board, Moves, Moves1),
        Width1 is Width - 1,
        available_moves_aux_aux(Game, Width1, Height, Board, Moves1, New_moves).

available_moves_coords(Game, Coords, Board, Moves, [Coords | Moves]):-
        num_jokers_to_place(Board, Jokers),
        Jokers > 0,
        place_joker(Game, Coords, _), !.
available_moves_coords(_, Coords, Board, Moves, [Coords | Moves]):-
        board_xy(Board, Coords, Cell),
        cell_xpiece(Cell, -1), !.
available_moves_coords(_, _, _, Moves, Moves).
