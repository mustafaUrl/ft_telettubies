

export default function tournament() {
    var tournament = document.getElementById('main-content');
    tournament.innerHTML = "";
    var participants = ['Adam', 'Matt', 'Evan', 'Abby', 'Heather', 'Christina', 'Ryan', 'Tyler', 'Steve', 'Steph', 'Jenna', 'Derek', 'Mike', 'Sam'];
    
    function createBracket() {
      var ul = document.createElement('ul');
      ul.classList.add('bracket');
      var li1 = document.createElement('li');
      var li2 = document.createElement('li');
      ul.appendChild(li1);
      ul.appendChild(li2);
      return ul;
    }
    
    function buildBracket(el) {
      var bracket = createBracket();
      el.appendChild(bracket);
    }
    
    function cleanUp() {
      var brackets = document.querySelectorAll('.bracket');
      var removed = false;
      for (var i = 0; i < brackets.length; i++) {
        var empty = true;
        var lis = brackets[i].getElementsByTagName('li');
        for (var j = 0; j < lis.length; j++) {
          if (lis[j].innerHTML !== '') {
            empty = false;
          }
        }
        if (empty) {
          brackets[i].parentNode.removeChild(brackets[i]);
          removed = true;
        }
      }
      return removed;
    }
    
    buildBracket(tournament);
    
    var level = 0;
    var previousBrackets = [];
    
    // Build 4 levels of brackets
    while (level < 4) {
      var brackets = document.querySelectorAll('.bracket');
      
      var newBrackets = Array.from(brackets).filter(function(el) {
        return previousBrackets.indexOf(el) < 0;
      });
      
      previousBrackets = previousBrackets.concat(newBrackets);
      
      newBrackets.forEach(function(bracket) {
        var lis = bracket.getElementsByTagName('li');
        for (var i = 0; i < lis.length; i++) {
          if (lis[i].innerHTML === '') {
            buildBracket(lis[i]);
          }
        }
      });
      
      level++;
    }
    
    // Remove empty lis until there are as many spots as participants
    while (cleanUp()) { }
    
    // Add participants to empty lis
    var emptyLis = document.querySelectorAll('li:empty');
    for (var i = 0; i < participants.length; i++) {
      emptyLis[i].innerHTML = '<button>' + participants[i] + '</button>';
    }
    
    // Check if bracket has 2 winners, if so, change to buttons
    function changeToButtons() {
      var brackets = document.querySelectorAll('.bracket');
      brackets.forEach(function(bracket) {
        var winners = bracket.querySelectorAll('.winner');
        if (winners.length === 2) {
          winners.forEach(function(winner) {
            winner.innerHTML = '<button class="winner">' + winner.textContent + '</button>';
          });
        }
      });
    }
    
    document.addEventListener('click', function(event) {
      if (event.target.tagName === 'BUTTON') {
        var ul = event.target.closest('ul');
        if (event.target.classList.contains('winner')) {
          ul = ul.parentNode.parentNode;
        }
        var li = document.createElement('li');
        li.classList.add('winner');
        li.textContent = event.target.textContent;
        ul.appendChild(li);
        
        // Replace all buttons on clicked tier with text
        var buttons = ul.getElementsByTagName('button');
        while (buttons.length) {
          buttons[0].parentNode.textContent = buttons[0].textContent;
        }
        
        changeToButtons();
      }
    });
}
