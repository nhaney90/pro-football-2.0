export class Config {
    static fieldSize = {
        lengthInYards: 100
    };
    static gameplay = {
        ballMovementSpeed: 200,
        gameLoopInterval: 100,
        playerStartingPosition: -2,
        quarterLength: 360,
        touchbackYardLine: 25
    }
    static kicking = {
        addedFieldGoalLength: 17,
        animationSpeed: 500,
        fieldGoalDelay: 1000,
        fieldGoalTileLimit: 7,
        kickoffLine: 35
    };
    static rules = {
        downs: 4,
        startingDown: 1,
        yardsToFirstDown: 10
    }
    static defenders = {
        cb: {
            reactZone: 6
        },
        de: {
            reactZone: 4
        },
        dt: {
            reactZone: 4
        },
        fs: {
            reactZone: 6
        },
        lb: {
            reactZone: 5
        }
    }
}