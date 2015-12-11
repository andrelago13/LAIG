% Visualization

xpiece_to_ascii(-1, ' ').
xpiece_to_ascii(0, 'X').
xpiece_to_ascii(1, 'R').
xpiece_to_ascii(2, 'G').

marker_to_ascii(-1, ' ').
marker_to_ascii(1, 'r').
marker_to_ascii(2, 'g').

print_board([H | T]) :-
        write('      0       1       2       3       4       5       6       7'), nl,
        print_dashed_line(H), nl,
        print_board_content([H | T], 0),
        write('      0       1       2       3       4       5       6       7'), nl.

print_board_content([], _) :- !.
print_board_content([H | T], N) :-
        N1 is N + 1,
        print_board_row(H, N), nl,
        print_dashed_line(H), nl,
        print_board_content(T, N1).

print_board_row([H | T], N) :-
        write('  |'), print_board_line_aux([H | T], 1), nl,
        write(N), write(' |'), print_board_line_aux([H | T], 2), write(' '), write(N), nl,
        write('  |'), print_board_line_aux([H | T], 3).
print_board_line_aux([Cell | T], Line) :-
        write(' '),
        cell_top_spiece(Cell, B),
        cell_xpiece(Cell, P),
        print_cell(B, P, Line),
        write(' |'),
        print_board_line_aux(T, Line).
print_board_line_aux([], _).

print_dashed_line(L) :-
        write('  '),
        print_dashed_line_aux(L).
print_dashed_line_aux([_ | T]) :-
        write('+-------'),
        print_dashed_line_aux(T).
print_dashed_line_aux([]) :- write('+').

print_cell(Marker, -1, _) :-
        marker_to_ascii(Marker, M),
        print(M),
        print(M),
        print(M),
        print(M),
        print(M).
print_cell(Marker, Xpiece, 1) :-
        Xpiece > -1,
        xpiece_to_ascii(Xpiece, X),
        marker_to_ascii(Marker, M),
        print(X),
        print(M),
        print(M),
        print(M),
        print(X).
print_cell(Marker, Xpiece, 2) :-
        Xpiece > -1,
        xpiece_to_ascii(Xpiece, X),
        marker_to_ascii(Marker, M),
        print(M),
        print(M),
        print(X),
        print(M),
        print(M).
print_cell(Marker, Xpiece, 3) :-
        Xpiece > -1,
        print_cell(Marker, Xpiece, 1).