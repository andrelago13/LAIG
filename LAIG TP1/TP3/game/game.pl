% Game

%start_game(-Game, +MaxScore, +Difficulty)
start_game(Game, MaxScore, Difficulty) :-
        game_board(Game, Board),
        create_board(Board),
        game_player(Game, 1),
        player_info_score(Player_info, 0),
        num_xpieces(N),
        player_info_num_xpieces(Player_info, N),
        game_player_info(Game, 1, Player_info),
        game_player_info(Game, 2, Player_info),
        game_max_score(Game, MaxScore),
        game_difficulty(Game, Difficulty).

%game_board(+Game, -Board)
game_board(Game, Board) :- nth0(0, Game, Board).

%game_player(+Game, -Player)
game_player(Game, Player) :- nth0(1, Game, Player).

%game_player_info(+Game, +Player, -Player_info)
game_player_info(Game, Player, Player_info) :-
        P2 is Player + 1,
        nth0(P2, Game, Player_info).

%game_max_score(+Game, -MaxScore)
game_max_score(Game, MaxScore) :- nth0(4, Game, MaxScore).

%game_difficulty(+Game, -Difficulty)
game_difficulty(Game, Difficulty) :- nth0(5, Game, Difficulty).

%game_player_scores(+Game, [-Score1, -Score2])
game_player_scores(Game, [Score1, Score2]) :-
        game_player_info(Game, 1, Info1),
        game_player_info(Game, 2, Info2),
        player_info_score(Info1, Score1),
        player_info_score(Info2, Score2).

%game_player_score(+Game, +Player, -Score)
game_player_score(Game, Player, Score) :-
        game_player_info(Game, Player, Info),
        player_info_score(Info, Score).

%game_set_board(+Game, +Board, -New_game)
game_set_board(Game, Board, New_game) :- replace(0, Board, Game, New_game).

%game_next_player(+Game, -New_game)
game_next_player(Game, New_game) :-
        game_player(Game, Player),
        next_player(Player, New_player),
        replace(1, New_player, Game, New_game).

%game_set_player_info(+Game, +Player, +Player_info, -New_game)
game_set_player_info(Game, Player, Player_info, New_game) :-
        P2 is Player + 1,
        replace(P2, Player_info, Game, New_game).

%game_inc_player_score(+Game, +Player, -New_game)
game_inc_player_score(Game, Player, New_game) :-
        game_player_info(Game, Player, Player_info1),
        player_info_score(Player_info1, Score),
        inc(Score, Score1),
        player_info_set_score(Player_info1, Score1, Player_info),
        game_set_player_info(Game, Player, Player_info, New_game).

%game_dec_player_score(+Game, +Player, -New_game)
game_dec_player_score(Game, Player, New_game) :-
        game_player_info(Game, Player, Player_info1),
        player_info_score(Player_info1, Score),
        dec(Score, Score1),
        player_info_set_score(Player_info1, Score1, Player_info),
        game_set_player_info(Game, Player, Player_info, New_game).

%game_inc_player_num_xpieces(+Game, +Player, -New_game)
game_inc_player_num_xpieces(Game, Player, New_game) :-
        game_player_info(Game, Player, Player_info1),
        player_info_num_xpieces(Player_info1, Num_xpieces),
        inc(Num_xpieces, Num_xpieces1),
        player_info_set_num_xpieces(Player_info1, Num_xpieces1, Player_info),
        game_set_player_info(Game, Player, Player_info, New_game).

%game_dec_player_num_xpieces(+Game, +Player, -New_game)
game_dec_player_num_xpieces(Game, Player, New_game) :-
        game_player_info(Game, Player, Player_info1),
        player_info_num_xpieces(Player_info1, Num_xpieces),
        dec(Num_xpieces, Num_xpieces1),
        player_info_set_num_xpieces(Player_info1, Num_xpieces1, Player_info),
        game_set_player_info(Game, Player, Player_info, New_game).

%game_value(+Game, -Value)
game_value(Game, Value) :-
        game_player(Game, Curr_Player),
        game_player_score(Game, Curr_Player, Curr_Score),
        next_player(Curr_Player, Other_Player),
        game_player_score(Game, Other_Player, Other_Score),
        Value is Curr_Score-Other_Score.                        %(Max_Score-(Max_Score - Curr_Score)) - (Max_Score-(Max_Score - Other_Score)).

%player_info_score(+Player_info, -Score).
player_info_score([Score, _], Score).

%player_info_num_xpieces(+Player_info, -Num_xpieces)
player_info_num_xpieces([_, Num_xpieces], Num_xpieces).

%player_info_set_score(+Player_info, +Score, -New_player_info)
player_info_set_score(Player_info, Score, New_player_info) :- replace(0, Score, Player_info, New_player_info).

%player_info_set_num_xpieces(+Player_info, +Num_xpieces, -New_player_info)
player_info_set_num_xpieces(Player_info, Num_xpieces, New_player_info) :- replace(1, Num_xpieces, Player_info, New_player_info).

%next_player(+Current_player, -Next_player)
next_player(1, 2).
next_player(2, 1).

%check_patterns(+Game, -New_scores)
% Returns a list containing the coords of all the pieces that form one or more scoring patterns in the board.
check_patterns(Game, New_scores) :-
        check_patterns_aux(Game, [0, 0], [], New_scores).
check_patterns_aux(Game, [X, Y], Scores, Scores) :-
        game_board(Game, Board),
        \+ board_xy(Board, [X, Y], _).
check_patterns_aux(Game, [X, Y], Scores, New_scores) :-
        game_board(Game, Board),
        board_xy(Board, [X, Y], _),
        check_patterns_aux_aux(Game, [X, Y], Scores, New_scores1),
        Y1 is Y + 1,
        check_patterns_aux(Game, [X, Y1], New_scores1, New_scores).
check_patterns_aux_aux(Game, [X, Y], Scores, Scores) :-
        game_board(Game, Board),
        \+ board_xy(Board, [X, Y], _).
check_patterns_aux_aux(Game, [X, Y], Scores, New_scores) :-
        game_board(Game, Board),
        board_xy(Board, [X, Y], _),
        check_pattern_x(Game, [X, Y], Scores, S1),
        check_pattern_plus(Game, [X, Y], S1, S2),
        check_pattern_5inarow(Game, [X, Y], S2, S3),
        X1 is X + 1,
        check_patterns_aux_aux(Game, [X1, Y], S3, New_scores).

check_pattern_x(Game, [X, Y], Scores, New_scores) :-
        Xm1 is X - 1,
        Xp1 is X + 1,
        Ym1 is Y - 1,
        Yp1 is Y + 1,
        check_pattern(Game, [[Xm1, Ym1], [Xp1, Ym1], [X, Y], [Xm1, Yp1], [Xp1, Yp1]], Scores, New_scores).

check_pattern_plus(Game, [X, Y], Scores, New_scores) :-
        Xm1 is X - 1,
        Xp1 is X + 1,
        Ym1 is Y - 1,
        Yp1 is Y + 1,
        check_pattern(Game, [[Xm1, Y], [Xp1, Y], [X, Y], [X, Ym1], [X, Yp1]], Scores, New_scores).

check_pattern_5inarow(Game, [X, Y], Scores, New_scores) :-
        check_pattern_5inarow_hor(Game, [X, Y], Scores, S1),
        check_pattern_5inarow_vert(Game, [X, Y], S1, S2),
        check_pattern_5inarow_diag1(Game, [X, Y], S2, S3),
        check_pattern_5inarow_diag2(Game, [X, Y], S3, New_scores).

check_pattern_5inarow_hor(Game, [X, Y], Scores, New_scores) :-
        Xm1 is X - 1,
        Xm2 is X - 2,
        Xp1 is X + 1,
        Xp2 is X + 2,
        check_pattern(Game, [[Xm2, Y], [Xm1, Y], [X, Y], [Xp1, Y], [Xp2, Y]], Scores, New_scores).

check_pattern_5inarow_vert(Game, [X, Y], Scores, New_scores) :-
        Ym1 is Y - 1,
        Ym2 is Y - 2,
        Yp1 is Y + 1,
        Yp2 is Y + 2,
        check_pattern(Game, [[X, Ym2], [X, Ym1], [X, Y], [X, Yp1], [X, Yp2]], Scores, New_scores).

check_pattern_5inarow_diag1(Game, [X, Y], Scores, New_scores) :-
        Xm1 is X - 1,
        Xm2 is X - 2,
        Xp1 is X + 1,
        Xp2 is X + 2,
        Ym1 is Y - 1,
        Ym2 is Y - 2,
        Yp1 is Y + 1,
        Yp2 is Y + 2,
        check_pattern(Game, [[Xm2, Ym2], [Xm1, Ym1], [X, Y], [Xp1, Yp1], [Xp2, Yp2]], Scores, New_scores).

check_pattern_5inarow_diag2(Game, [X, Y], Scores, New_scores) :-
        Xm1 is X - 1,
        Xm2 is X - 2,
        Xp1 is X + 1,
        Xp2 is X + 2,
        Ym1 is Y - 1,
        Ym2 is Y - 2,
        Yp1 is Y + 1,
        Yp2 is Y + 2,
        check_pattern(Game, [[Xp2, Ym2], [Xp1, Ym1], [X, Y], [Xm1, Yp1], [Xm2, Yp2]], Scores, New_scores).

check_pattern(Game, Coords_list, Scores, New_scores) :-
        check_pattern_aux(Game, Coords_list), !,
        \+ member_list_chk(Coords_list, Scores),
        append(Scores, Coords_list, New_scores1),
        remove_dups(New_scores1, New_scores).
check_pattern(_, _, Scores, Scores).

check_pattern_aux(_, []).
check_pattern_aux(Game, [[X, Y] | T]) :-
        game_board(Game, Board),
        board_xy(Board, [X, Y], Cell),
        check_pattern_valid_cell(Game, Cell),
        check_pattern_aux(Game, T).

check_pattern_valid_cell(Game, Cell) :-
        game_player(Game, Player),
        cell_xpiece(Cell, Player).
check_pattern_valid_cell(_, Cell) :-
        cell_xpiece(Cell, 0). % Joker

convert_patterns_to_score(Game, [], Game).
convert_patterns_to_score(Game, [Coords | T], New_game) :-
        convert_pattern_to_score(Game, Coords, Game1),
        convert_patterns_to_score(Game1, T, New_game).

convert_pattern_to_score(Game, [], Game) :- !.
convert_pattern_to_score(Game, Coords, New_game) :-
        game_board(Game, Board),
        game_player(Game, Player),
        board_xy(Board, Coords, Cell),
        cell_set_top_piece(Cell, Player, Cell1),
        cell_convert_xpiece_to_spiece(Cell1, Cell2),
        board_set_cell(Board, Coords, Cell2, Board1),
        game_set_board(Game, Board1, Game1),
        game_inc_player_num_xpieces(Game1, Player, Game2),
        game_inc_player_score(Game2, Player, New_game).

%show_scores(+Game)
show_scores(Game) :-
        game_player_info(Game, 1, P1Info),
        game_player_info(Game, 2, P2Info),
        player_info_score(P1Info, P1Score),
        player_info_score(P2Info, P2Score),
        print_scores(P1Score, P2Score).

%print_game(+Game)
print_game(Game) :-
        game_board(Game, Board),
        print_board(Board), 
        show_scores(Game), nl.

%game_ended(+Game)
% Is true if the game's state is final.
game_ended(Game) :-
        game_max_score(Game, MaxScore),
        game_ended(Game, MaxScore).
game_ended(Game) :-
        game_player_info(Game, 1, Player_info),
        player_info_num_xpieces(Player_info, 0), !.
game_ended(Game) :-
        game_player_info(Game, 2, Player_info),
        player_info_num_xpieces(Player_info, 0), !.
game_ended(Game, MaxScore) :-
        player_score(Game, 1, Score),
        Score >= MaxScore, !.
game_ended(Game, MaxScore) :-
        player_score(Game, 2, Score),
        Score >= MaxScore.

%game_winner(+Game, -Winner)
% Winner is the ID of the winning player.
game_winner(Game, Winner) :-
        game_next_player(Game, New_game),
        game_player(New_game, Winner).

%player_score(+Game, +Player, -Score)
player_score(Game, Player, Score) :-
        game_board(Game, Board),
        count_bases(Board, Player, Score).

%count_bases(+Board, +Player, -Count)
count_bases([], _, 0).
count_bases([Row|Rest], Player, Count) :-
        count_bases_row(Row, Player, Count1),
        count_bases(Rest, Player, Count2),
        Count is Count1+Count2.

count_bases_row([], _, 0).
count_bases_row([[[Player|_]|_]|Rest], Player, Count) :-
        count_bases_row(Rest, Player, Count1),
        Count is Count1+1.
count_bases_row([_|Rest], Player, Count) :- 
        count_bases_row(Rest, Player, Count).

game_update_scores([Board, Player, P1Info, P2Info, MS, Diff], [Board, Player, P1InfoNew, P2InfoNew, MS, Diff]) :-
        board_get_scores(Board, P1Score, P2Score),
        player_info_set_score(P1Info, P1Score, P1InfoNew),
        player_info_set_score(P2Info, P2Score, P2InfoNew).


