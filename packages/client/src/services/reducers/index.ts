import gameReducer from './game/game-slice';
import forumReducer from './forum/forum-slice';

const reducer = {
  game: gameReducer,
  forum: forumReducer,
};

export default reducer;
