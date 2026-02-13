

export function getDraftOrder(users: string[], rounds: number) {

    const draftOrder = []; 
    for(let i = 0; i < rounds; i++) {
        const loopUsers = [...users]; 
        const isSnakeReverseRound = i % 2 === 1;
        const roundUsers = isSnakeReverseRound ? loopUsers.reverse() : loopUsers;
        draftOrder.push(...roundUsers);
    }
    return draftOrder;
}