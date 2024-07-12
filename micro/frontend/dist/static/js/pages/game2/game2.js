export default function game2() {
    var game2 = document.getElementById('main-content');
    game2.innerHTML = "";
    var game2Container = document.createElement('div');
    game2Container.classList.add('game2-container');
    game2.appendChild(game2Container);
    var game2Title = document.createElement('h1');
    game2Title.classList.add('game2-title');
    game2Title.innerHTML = 'Game 2';
    game2Container.appendChild(game2Title);
    var game2Text = document.createElement('p');
    game2Text.classList.add('game2-text');
    game2Text.innerHTML = 'This is the second game.';
    game2Container.appendChild(game2Text);
}