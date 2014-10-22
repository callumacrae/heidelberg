'use strict';

var currentPage = 0;

var book1 = new Heidelberg($('#Heidelberg-example-1'), {
  hasSpreads: true,
  onPageTurn: function (el, els) {
    currentPage = els.pagesTarget.index();

    var $letters = $('.letter');
    var index = (currentPage - 7) / 4;

    var darkSide = (index % 1 === 0) ? 'right' : 'left';

    if (index >= 0 && index < $letters.length) {
      handleTurn($letters.eq(Math.floor(index)), darkSide);
    } else {
      handleTurn(-1);
    }
  }
});

function handleTurn($letter, darkSide) {
  var $letters = $('.letters');
  var $indicator = $('.indicator');

  if ($letter === -1) {
    $indicator.css('opacity', 0);

    $letters.find('.active').removeClass('active');

    return;
  }

  var $page = $letters.find('.letter').eq($letter.index());
  var offset = $page.offset().left - $page.parent().offset().left;

  $letter.addClass('active')
    .siblings('.active').removeClass('active');

  $indicator.css({ left: offset, opacity: 1 })
    .find('div').removeClass('dark')
    .eq(darkSide === 'left' ? 0 : 1).addClass('dark');
}

$('.letters').on('click', '.letter', function () {
  var newPage = $(this).index() * 4 + 7;

  if (newPage === currentPage) {
    newPage += 2;
  }

  book1.turnPage(newPage);
});
