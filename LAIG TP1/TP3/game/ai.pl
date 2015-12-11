ai_bot_random(MovesPred, Game, Move) :-
        Ms =.. [MovesPred, Game, Moves],
        Ms,
        random_member(Move, Moves).

ai_bot_greedy(MovesPred, MovePred, ValuePred, Game, BestMove) :-
        Ms =.. [MovesPred, Game, Moves],
        Ms,
        ai_evaluate_and_choose_aux(Moves, MovePred, ValuePred, Game, [[0, 0], -99999], [BestMoves1 | _]),
        ai_bot_greedy_aux(BestMoves1, MovesPred, MovePred, ValuePred, Game, [[0, 0], -99999], [BestMoves | _]),
        random_member(BestMove, BestMoves).

ai_bot_greedy_aux([Move1 | Moves1], MovesPred, MovePred, ValuePred, Game, Record, BestMoves) :-
        M1 =.. [MovePred, Game, Move1, Game1],
        M1,
        ai_evaluate_and_choose(MovesPred, MovePred, ValuePred, Game1, BestMove),
        M2 =.. [MovePred, Game1, BestMove, NewGame],
        M2,
        V2 =.. [ValuePred, NewGame, Value],
        V2,
        ai_update(Move1, Value, Record, BestMoves1),
        ai_bot_greedy_aux(Moves1, MovesPred, MovePred, ValuePred, Game, BestMoves1, BestMoves).
ai_bot_greedy_aux([], _, _, _, _, BestMoves, BestMoves).
        
ai_evaluate_and_choose(MovesPred, MovePred, ValuePred, Game, BestMove) :-
        Ms =.. [MovesPred, Game, Moves],
        Ms,
        ai_evaluate_and_choose_aux(Moves, MovePred, ValuePred, Game, [[0, 0], -99999], [BestMoves, _]),
        random_member(BestMove, BestMoves).
        
ai_evaluate_and_choose_aux([Move | Moves], MovePred, ValuePred, Game, Record, BestMoves) :-
        M =.. [MovePred, Game, Move, NewGame],
        M,
        V =.. [ValuePred, NewGame, Value],
        V,
        ai_update(Move, Value, Record, BestMoves1),
        ai_evaluate_and_choose_aux(Moves, MovePred, ValuePred, Game, BestMoves1, BestMoves).
ai_evaluate_and_choose_aux([], _, _, _, BestMoves, BestMoves).

ai_update(_, Value, [Moves, Value1], [Moves, Value1]) :- Value < Value1, !.
ai_update(Move, Value, [Moves, Value], [[Move | Moves], Value]) :- !.
ai_update(Move, Value, [_, _], [[Move], Value]).