% CLI

cli_get_char(C) :-
        get_char(C),
        get_char(_).

cli_get_digit(D) :-
        get_code(C),
        get_char(_),
        D is C - 48.

cli_get_number(Num) :- cli_get_number_aux_aux(Num, 0).

cli_get_number_aux_aux(Num, CurrVal) :-
        get_code(C), !,
        cli_get_number_aux(Num, C, CurrVal).

cli_get_number_aux(Res, 10, Res).
cli_get_number_aux(Result, Curr_Dig, CurrVal) :-
        Num is Curr_Dig - 48,
        Result1 is CurrVal*10 + Num, !,
        cli_get_number_aux_aux(Result, Result1).
        