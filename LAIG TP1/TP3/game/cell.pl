% Cell

cell_spieces([Ss, _], Ss).
cell_xpiece([_, X], X).
cell_top_spiece(Cell, S) :- 
        cell_spieces(Cell, []),
        S = -1.
cell_top_spiece(Cell, S) :-
        cell_spieces(Cell, [S | _]).
cell_convert_xpiece_to_spiece([Ss, 0], [Ss, -1]).
cell_convert_xpiece_to_spiece([[], X], [[X], -1]) :- X \= -1.
cell_convert_xpiece_to_spiece([[X | Ss], X], [[X | Ss], -1]) :- X \= -1.
cell_convert_xpiece_to_spiece([Ss, X], [[X | Ss], -1]) :- X \= -1.

cell_set_top_piece([Bases, _], Value, [Bases, Value]).