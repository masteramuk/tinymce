define(
  'ephox.darwin.navigation.BrTags',

  [
    'ephox.darwin.navigation.BeforeAfter',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.node.Text',
    'ephox.sugar.api.search.ElementAddress',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.api.selection.Awareness',
    'ephox.sugar.api.selection.Situ'
  ],

  function (BeforeAfter, Fun, Option, Spot, Node, Text, ElementAddress, Traverse, Awareness, Situ) {
    var isBr = function (elem) {
      return Node.name(elem) === 'br';
    };

    var gatherer = function (cand, gather, isRoot) {
      return gather(cand, isRoot).bind(function (target) {
        return Node.isText(target) && Text.get(target).trim().length === 0 ? gatherer(target, gather, isRoot) : Option.some(target);
      });
    };

    var handleBr = function (isRoot, element, direction) {
      // 1. Has a neighbouring sibling ... position relative to neighbouring element
      // 2. Has no neighbouring sibling ... position relative to gathered element
      return direction.traverse(element).orThunk(function () {
        return gatherer(element, direction.gather, isRoot);
      }).map(direction.relative);
    };

    var findBr = function (element, offset) {
      return Traverse.child(element, offset).filter(isBr).orThunk(function () {
        // Can be either side of the br, and still be a br.
        return Traverse.child(element, offset-1).filter(isBr);
      });
    };

    var handleParent = function (isRoot, element, offset, direction) {
      // 1. Has no neighbouring sibling, position relative to gathered element
      // 2. Has a neighbouring sibling, position at the neighbouring sibling with respect to parent
      return findBr(element, offset).bind(function (br) {
        return direction.traverse(br).fold(function () {
          return gatherer(br, direction.gather, isRoot).map(direction.relative);
        }, function (adjacent) {
          return ElementAddress.indexInParent(adjacent).map(function (info) {
            return Situ.on(info.parent(), info.index());
          });
        });
      });
    };

    var tryBr = function (isRoot, element, offset, direction) {
      // Three different situations
      // 1. the br is the child, and it has a previous sibling. Use parent, index-1)
      // 2. the br is the child and it has no previous sibling, set to before the previous gather result
      // 3. the br is the element and it has a previous sibling, use parent index-1)
      // 4. the br is the element and it has no previous sibling, set to before the previous gather result.
      // 2. the element is the br itself,
      var target = isBr(element) ? handleBr(isRoot, element, direction) : handleParent(isRoot, element, offset, direction);
      return target.map(function (tgt) {
        return {
          start: Fun.constant(tgt),
          finish: Fun.constant(tgt)
        };
      });
    };

    var process = function (analysis) {
      return BeforeAfter.cata(analysis,
        function (message) {
          return Option.none('BR ADT: none');
        },
        function () {
          return Option.none();
        },
        function (cell) {
          return Option.some(Spot.point(cell, 0));
        },
        function (cell) {
          return Option.some(Spot.point(cell, Awareness.getEnd(cell)));
        }
      );
    };

    return {
      tryBr: tryBr,
      process: process
    };
  }
);