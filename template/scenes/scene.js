// Scene runtime. Every scene shows its finished state first and holds it, so PDFs,
// thumbnails and flattened exports capture a slide that explains itself. Then it loops.
// Each helper publishes window.__scene = { loopStart, loopEnd } (seconds after load): the
// exact window of one clean loop, which the GIF recorder trims to.
(function () {
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var still = /[?&]still\b/.test(location.search);
  var DEFAULT_HOLD = 4000;

  window.Scene = {
    // render(i) draws step i of count. Starts on the last step, holds, then cycles from 0.
    steps: function (o) {
      var hold = o.holdMs == null ? DEFAULT_HOLD : o.holdMs;
      var i = o.count - 1;
      o.render(i);
      var start = hold + o.stepMs;
      window.__scene = { loopStart: start / 1000, loopEnd: (start + o.count * o.stepMs) / 1000 };
      if (reduce || still) return;
      setTimeout(function () {
        setInterval(function () {
          i = (i + 1) % o.count;
          o.render(i);
        }, o.stepMs);
      }, hold);
    },

    // Pure CSS animations that start at load and repeat every periodMs.
    css: function (o) {
      window.__scene = { loopStart: 0, loopEnd: o.periodMs / 1000 };
      if (reduce || still) document.documentElement.classList.add("scene-still");
    },

    // finish() draws the end state; play() runs one full pass lasting durationMs, using
    // setTimeout chains (setInterval drifts) and ending on the finished state.
    timeline: function (o) {
      var hold = o.holdMs == null ? DEFAULT_HOLD : o.holdMs;
      o.finish();
      window.__scene = { loopStart: hold / 1000, loopEnd: (hold + o.durationMs) / 1000 };
      if (reduce || still) return;
      setTimeout(function loop() {
        o.play();
        setTimeout(loop, o.durationMs);
      }, hold);
    },
  };
})();
