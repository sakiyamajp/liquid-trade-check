let WOW;

(function ($) {

  WOW = function WOW() {

    return {

      init: function init() {

        const animationName = [];
        const $selector = $('.wow');
        const defaultOffset = 100;
        let once = 1;

        function mdbWow() {

          const windowHeight = window.innerHeight;
          const scroll = window.scrollY;

          $selector.each(function () {
            const $this = $(this);
            const index = $this.index('.wow');
            const iteration = $this.data('wow-iteration');
            let duration = $this.data('wow-duration');
            let delay = $this.data('wow-delay');
            let removeTime = $this.css('animation-duration').slice(0, -1) * 1000;

            if ($this.css('visibility') === 'visible') {
              return;
            }

            if (windowHeight + scroll - defaultOffset > getOffset(this) && scroll < getOffset(this) || windowHeight + scroll - defaultOffset > getOffset(this) + $this.height() && scroll < getOffset(this) + $this.height() || windowHeight + scroll === $(document).height() && getOffset(this) + defaultOffset > $(document).height()) {

              if (delay) {
                delay = $this.data('wow-delay').slice(0, -1);
                removeTime += $this.data('wow-delay') ? $this.data('wow-delay').slice(0, -1) * 1000 : false;
              }

              if (duration) {
                duration = $this.data('wow-duration').slice(0, -1);
                removeTime = $this.css('animation-duration').slice(0, -1) * 1000 + $this.data('wow-duration').slice(0, -1) * 1000;
              }
              setTimeout(() => $this.removeClass('animated'), removeTime);

              $this.addClass('animated');
              $this.css({
                visibility: 'visible',
                'animation-name': animationName[index],
                'animation-iteration-count' : iteration ? iteration : 1,
                'animation-duration' : duration ? duration : false,
                'animation-delay':  delay ? `${delay}s` : false
              });
            }
          });
        }

        function appear() {

          $selector.each(function () {
            const $this = $(this);
            const index = $this.index('.wow');
            const iteration = $this.data('wow-iteration');
            const duration = $this.data('wow-duration');
            let delay = $this.data('wow-delay');

            delay = delay ? $this.data('wow-delay').slice(0, -1) : false;
            $this.addClass('animated');
            $this.css({
              visibility: 'visible',
              'animation-name': animationName[index],
              'animation-iteration-count' : iteration ? iteration : 1,
              'animation-duration' : duration ? duration : false,
              'animation-delay':  delay ? `${delay}s` : false
            });
          });
        }

        function hide() {

          const windowHeight = window.innerHeight;
          const scroll = window.scrollY;

          $('.wow.animated').each(function () {
            const $this = $(this);

            if (windowHeight + scroll - defaultOffset > getOffset(this) && scroll > getOffset(this) + defaultOffset || windowHeight + scroll - defaultOffset < getOffset(this) && scroll < getOffset(this) + defaultOffset || getOffset(this) + $this.height > $(document).height() - defaultOffset) {

              $this.removeClass('animated');
              $this.css({
                'animation-name': 'none',
                visibility: 'hidden'
              });
            }
          });

          mdbWow();

          once--;
        }

        function getOffset(elem) {

          const box = elem.getBoundingClientRect();
          const body = document.body;
          const docEl = document.documentElement;
          const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
          const clientTop = docEl.clientTop || body.clientTop || 0;
          const top = box.top + scrollTop - clientTop;

          return Math.round(top);
        }

        $selector.each(function () {
          const $this = $(this);

          animationName[$this.index('.wow')] = $this.css('animation-name');
          $this.css({
            visibility: 'hidden',
            'animation-name': 'none'
          });
        });

        $(window).scroll(() => {
          return once ? hide() : mdbWow();
        });

        appear();
      }
    };
  };
  return WOW;
}(jQuery));
