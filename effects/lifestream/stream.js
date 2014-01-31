// Generated by CoffeeScript 1.6.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  this.Stream = (function(_super) {
    __extends(Stream, _super);

    Stream.prototype.drawGizmos = false;

    Stream.prototype.velocity = 150;

    Stream.prototype.interval = 1000;

    Stream.prototype.tension = 0.40;

    Stream.prototype.maxSegments = 5;

    function Stream(config) {
      Kinetic.Group.call(this, config);
      this.setup(config);
    }

    Stream.prototype.setup = function(config) {
      var initPoint;
      if (config.drawGizmos != null) {
        this.drawGizmos = config.drawGizmos;
      }
      if (config.interval != null) {
        this.interval = config.interval;
      }
      if (config.maxSegments != null) {
        this.maxSegments = config.maxSegments;
      }
      initPoint = config.startPosition != null ? config.startPosition : {
        x: 0,
        y: 0
      };
      this.capturePoints = [Coord2d.fromObject(initPoint)];
      this.currentTime = this.interval;
      this.kAllSegmentsGizmo = new Kinetic.Line({
        points: [],
        stroke: 'red',
        strokeWidth: 1
      });
      this.kActiveSegmentsGizmo = new Kinetic.Line({
        points: [],
        stroke: 'yellow',
        strokeWidth: 1
      });
      this.kBody = new Bezier({
        points: [],
        stroke: 'white',
        opacity: 0.5,
        strokeWidth: 2
      });
      this.kHead = new Bezier({
        points: [],
        stroke: 'white',
        opacity: 0.5,
        strokeWidth: 2
      });
      this.kTail = new Bezier({
        points: [],
        stroke: 'white',
        opacity: 0.5,
        strokeWidth: 2
      });
      this.gizmos = new Kinetic.Group();
      this.gizmos.add(this.kAllSegmentsGizmo);
      if (this.drawGizmos) {
        this.add(this.gizmos);
      }
      this.add(this.kBody);
      this.add(this.kHead);
      return this.add(this.kTail);
    };

    Stream.prototype.lastPoint = function() {
      return this.capturePoints[this.capturePoints.length - 1];
    };

    Stream.prototype.pushPoint = function(c) {
      return this.capturePoints.push(c);
    };

    Stream.prototype.segmentAngleAt = function(i) {
      var a0, a1, p0, p1, p2;
      if (i === 0) {
        p0 = this.capturePoints[i];
        p1 = this.capturePoints[i + 1];
        return Coord2d.angleFromDiff(p0.x, p0.y, p1.x, p1.y);
      } else if (i === this.capturePoints.length - 1) {
        p0 = this.capturePoints[i - 1];
        p1 = this.capturePoints[i];
        return Coord2d.angleFromDiff(p0.x, p0.y, p1.x, p1.y);
      }
      p0 = this.capturePoints[i - 1];
      p1 = this.capturePoints[i];
      p2 = this.capturePoints[i + 1];
      a0 = Coord2d.angleFromDiff(p0.x, p0.y, p1.x, p1.y);
      a1 = Coord2d.angleFromDiff(p1.x, p1.y, p2.x, p2.y);
      return a0 + 0.5 * (a1 - a0);
    };

    Stream.prototype.captureSegment = function(target) {
      var last, newPoint;
      last = this.lastPoint();
      newPoint = Coord2d.fromPolar(this.velocity, Coord2d.angleFromDiff(last.x, last.y, target.x, target.y));
      newPoint.add(last);
      return this.pushPoint(newPoint);
    };

    Stream.prototype.update = function(dt, target) {
      var activeEnd, activeStart, body, c1, c2, coord, head, headPoints, i, isIntervalChange, newPoints, p1, p2, pLen, r, t, tail, tailPoints, _i, _j, _k, _l, _len, _ref, _ref1, _results;
      isIntervalChange = false;
      target = Coord2d.fromObject(target);
      this.currentTime += dt;
      if (this.currentTime >= this.interval) {
        this.currentTime -= this.interval;
        this.captureSegment(target);
        isIntervalChange = true;
      }
      t = this.currentTime / this.interval;
      pLen = this.capturePoints.length;
      body = this.kBody.getPoints();
      head = this.kHead.getPoints();
      tail = this.kTail.getPoints();
      if (this.drawGizmos) {
        newPoints = [];
        _ref = this.capturePoints;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          coord = _ref[i];
          newPoints.push(coord.x);
          newPoints.push(coord.y);
        }
        this.kAllSegmentsGizmo.setPoints(newPoints);
        newPoints = [];
        if (pLen >= 4) {
          for (i = _j = 0, _ref1 = pLen - 4; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
            newPoints.push(this.capturePoints[i].x);
            newPoints.push(this.capturePoints[i].y);
            newPoints.push(this.capturePoints[i + 1].x);
            newPoints.push(this.capturePoints[i + 1].y);
          }
        }
        if (pLen >= 3) {
          activeStart = this.capturePoints[pLen - 3];
          activeEnd = this.capturePoints[pLen - 2];
          newPoints.push(activeStart.x);
          newPoints.push(activeStart.y);
          newPoints.push(Math.lerp(activeStart.x, activeEnd.x, t));
          newPoints.push(Math.lerp(activeStart.y, activeEnd.y, t));
          this.kActiveSegmentsGizmo.setPoints(newPoints);
        }
      }
      if (pLen < 3) {
        return;
      }
      c1 = new Coord2d();
      c2 = new Coord2d();
      r = this.tension * this.velocity;
      if (isIntervalChange) {
        if (pLen > this.maxSegments + 4) {
          this.capturePoints.shift();
          pLen = this.capturePoints.length;
          body.splice(0, 8);
        }
        if (this.maxSegments >= 2) {
          while (body.length > (this.maxSegments - 2) * 8) {
            body.splice(0, 8);
          }
          if (pLen >= 4) {
            p1 = this.capturePoints[pLen - 4];
            p2 = this.capturePoints[pLen - 3];
            c1.fromPolar(r, this.segmentAngleAt(pLen - 4));
            c1.add(p1);
            c2.fromPolar(-r, this.segmentAngleAt(pLen - 3));
            c2.add(p2);
            body.push(p1.x, p1.y, c1.x, c1.y, c2.x, c2.y, p2.x, p2.y);
          }
        }
      }
      if (pLen >= 3) {
        p1 = this.capturePoints[pLen - 3];
        p2 = this.capturePoints[pLen - 2];
        c1.fromPolar(r, this.segmentAngleAt(pLen - 3));
        c1.add(p1);
        c2.fromPolar(-r, this.segmentAngleAt(pLen - 2));
        c2.add(p2);
        headPoints = Math.splitBezier(p1.x, p1.y, c1.x, c1.y, c2.x, c2.y, p2.x, p2.y, 0, t);
        if (head.length === 0) {
          head.push.apply(head, headPoints);
        } else {
          for (i = _k = 0; _k <= 7; i = ++_k) {
            head[i] = headPoints[i];
          }
        }
      }
      if (pLen >= this.maxSegments + 3) {
        i = pLen < this.maxSegments + 4 ? 0 : 1;
        p1 = this.capturePoints[i];
        p2 = this.capturePoints[i + 1];
        c1.fromPolar(r, this.segmentAngleAt(i));
        c1.add(p1);
        c2.fromPolar(-r, this.segmentAngleAt(i + 1));
        c2.add(p2);
        tailPoints = Math.splitBezier(p1.x, p1.y, c1.x, c1.y, c2.x, c2.y, p2.x, p2.y, t, 1);
        if (tail.length === 0) {
          return tail.push.apply(tail, tailPoints);
        } else {
          _results = [];
          for (i = _l = 0; _l <= 7; i = ++_l) {
            _results.push(tail[i] = tailPoints[i]);
          }
          return _results;
        }
      }
    };

    return Stream;

  })(Kinetic.Group);

}).call(this);

/*
//@ sourceMappingURL=stream.map
*/
