



export default function calcFortyForForty(runs: number[]) {
    const pointsToAward = [
        {contest: 0, time: 6.26},
        {contest: 0, time: 6.34},
        {contest: 0, time: 6.45},
        {contest: 0, time: 6.48},
        {contest: 0, time: 6.55},
        {contest: 1, time: 5.08},
        {contest: 1, time: 5.17},
        {contest: 1, time: 5.22},
        {contest: 1, time: 5.31},
        {contest: 1, time: 5.40},
        {contest: 2, time: 8.89},
        {contest: 2, time: 8.98},
        {contest: 2, time: 9.06},
        {contest: 2, time: 9.21},
        {contest: 2, time: 9.27},
        {contest: 3, time: 12.47},
        {contest: 3, time: 12.55},
        {contest: 3, time: 12.77},
        {contest: 3, time: 12.79},
        {contest: 3, time: 12.96},
        {contest: 4, time: 7.87},
        {contest: 4, time: 7.98},
        {contest: 4, time: 8.05},
        {contest: 4, time: 8.18},
        {contest: 4, time: 8.20},
        {contest: 5, time: 8.94},
        {contest: 5, time: 9.11},
        {contest: 5, time: 9.22},
        {contest: 5, time: 9.29},
        {contest: 5, time: 9.40},
        {contest: 6, time: 6.05},
        {contest: 6, time: 6.18},
        {contest: 6, time: 6.28},
        {contest: 6, time: 6.37},
        {contest: 6, time: 6.53},
        {contest: 7, time: 20.99},
        {contest: 7, time: 21.64},
        {contest: 7, time: 21.99},
        {contest: 7, time: 22.60},
        {contest: 7, time: 22.73},
    ]

    return runs.map((time, contestIndex) => {
        const contestEntries = pointsToAward.filter(e => e.contest === contestIndex)
        return contestEntries.filter(e => time < e.time).length
    })
}