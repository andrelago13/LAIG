% Utils

member_list_chk([], _).
member_list_chk([H | T], List2) :-
        memberchk(H, List2),
        member_list_chk(T, List2).

replace(N, X, L1, L2) :-
        length(L3, N),
        append(L3, [_ | T], L1),
        append(L3, [X | T], L2).

inc(X, X1) :- X1 is X + 1.
dec(X, X1) :- X1 is X - 1.