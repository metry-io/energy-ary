'use strict';

/**
 * @ngdoc directive
 * @name energyArtApp.star.directive
 * @description
 * # star.directive
 *
 */

angular.module('energyArtApp')
  .directive('star', ['d3Service', 'dataservice', 'visService', 'twitterShareService', function (d3Service, dataservice, visService, ts) {
    return {
      restrict: 'E',
      link: function (scope, ele) {

        visService.init(scope, renderVis);

        var config = {
          scale: 40
        };

        function renderVis() {
          d3Service.d3().then(function (d3) {

            var width = angular.element(window)[0].innerWidth,
              height = angular.element(window)[0].innerHeight;

            // Make sure that the element i cleaned from svg's
            d3.select(ele[0]).selectAll("svg").remove();

            var vis = d3.select(ele[0])
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              .attr("id", "visualization");

            vis.append("rect")
              .attr("width", width)
              .attr("height", height)
              .attr("fill", "#161616");

            var valueScale = d3.scale.linear()
              .domain([0, scope.max])
              .range([0, 10]);

            var color = d3.scale.linear()
              .clamp(true)
              .domain([0, scope.max])
              .range([scope.startColor, scope.endColor]);

            var arc = d3.svg.arc()
              .innerRadius(0)
              .outerRadius(function (d) {
                return valueScale(d.value) * config.scale;
              })
              .startAngle(function (d, i) {
                return (i - 1) * 2 * Math.PI / 24;
              })
              .endAngle(function (d, i) {
                return i * 2 * Math.PI / 24;
              });

            window.onresize = function () {
              scope.$apply();
            };

            // Watch for resize event
            scope.$watch(function () {
              return angular.element(window)[0].innerWidth;
            }, function () {
              width = angular.element(window)[0].innerWidth;
              height = angular.element(window)[0].innerHeight;

              scope.render(scope.days);
            });

            scope.render = function (days) {

              vis.selectAll("path")
                .data(days)
                .enter()
                .append("path")
                .attr("d", arc)
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
                .attr("fill", function (d) {
                  return color(d.value);
                })
                .attr("opacity", "0.05")
                .append("title");

              // We update the dimensions to enable correct ratio when sharing the image
              ts.setDimensions(width, height);
              scope.rendered = true;
            };
          });
        }
      }
    };
  }]);
