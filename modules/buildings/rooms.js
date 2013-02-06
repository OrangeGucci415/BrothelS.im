"use strict";
var Rooms = {};

e.Ready.push(function(done) {
  $.each(Rooms, function(type, room) {
    room.type = type;
  });
  done();
});

Building.prototype.buyRoom = function(type) {
  var base = Rooms[type].base || { size: 1 };
  var room = $.extend(true, {}, base);
  room.type = type;
  g.money -= Rooms[type].price;
  this.rooms.push(room);
};

Building.prototype.sellRoom = function(index) {
  var room = Rooms[this.rooms[index].type];
  g.money += Math.floor(room.price * Building.config.sellRatio);
  this.rooms.splice(index, 1);
};

Building.roomsByType = function(type, status) {
  status = status || 'Owned';
  if (!g.buildings) { return []; }
  var rooms = g.buildings._filter('status', status)._accumulate('rooms');
  return rooms._flatten()._filter('type', type);
};

Building.roomKeySum = function(type, key, status) {
  status = status || 'Owned';
  return Building.roomsByType(type, status)._accumulate(key)._sum();
};

Building.prototype.potentialRooms = function() {
  var rooms = {};
  var building = this;
  $.each(Rooms, function(type, room) {
    if (room.maxInBuilding <= building.rooms._filter('type', type).length) {
      return;
    }
    rooms[type] = room;
  });
  return rooms;
};

Girl.prototype.bedroom = function() {
  var rooms = Building.roomsByType('Bedroom', 'Owned');
  return rooms._filter('girl', this.name)[0];
};

e.BuildingDailyDelta.push(function(building, delta) {
  building.rooms.forEach(function(room) {
    if (Rooms[room.type].daily) {
      delta._add(Rooms[room.type].daily);
    }
  });
});
