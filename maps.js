/**
 * @author Tomas Hanacek
 * Maps structures
 */

var maps = {};
maps["for_a_good_night"] = {
    "name": "for_a_good_night",
    "background": "grow",
    "width": 800,
    "height": 600,
    "music": "for_a_good_night.ogg",
    "images": [
        {"file": "l1.grow.png", "name": "grow", "alpha": "no"},
        {"file": "l1.hut.png", "name": "hut", "alpha": "yes"},
        {"file": "l1.peduncle.png", "name": "peduncle", "alpha": "yes"},
        {"file": "l1.tree.png", "name": "tree", "alpha": "yes"},
        {"file": "l1.wood.png", "name": "wood", "alpha": "yes"}
    ],
    "walls": [
        {"img_width":269, "img_height":159, "img_x":75, "img_y":20, "layer":1, "image":"hut"},
        {"x": 120, "y": 159, "width": 180, "height": 65, "img_width":254, "img_height":81, "img_x":90, "img_y":159, "layer":0, "image":"peduncle"},
        {"x": 520, "y": 260, "width": 161, "height": 100, "img_width":231, "img_height":204, "img_x":500, "img_y":180, "layer":0, "image":"tree"},
        {"x": 220, "y": 400, "width": 110, "height": 10, "img_width":146, "img_height":51, "img_x":200, "img_y":370, "layer":0, "image":"wood"}
    ]
};

maps["in_a_captivity_of_8-bit"] = {
    "name": "in_a_captivity_of_8-bit",
    "background": "nic",
    "width": 800,
    "height": 600,
    "music": "in_a_captivity_of_8-bit.ogg",
    "images": [
        {"file": "l3.nic.png", "name": "nic", "alpha": "no"},
        {"file": "l3.ihlan.png", "name": "ihlan", "alpha": "yes"},
        {"file": "l3.kvader1.png", "name": "kvader1", "alpha": "yes"},
        {"file": "l3.kvader2.png", "name": "kvader2", "alpha": "yes"},
        {"file": "l3.teleport.png", "name": "teleport", "alpha": "yes"}
    ],
    "walls": [
        {"x": 512, "y": 320, "width": 125, "height": 100, "img_width":148, "img_height":318, "img_x":500, "img_y":125, "layer":0, "image":"ihlan"},
        {"x": 273, "y": 152, "width": 180, "height": 75, "img_width":221, "img_height":174, "img_x":250, "img_y":62, "layer":0, "image":"kvader1"},
        {"x": 90, "y": 275, "width": 87, "height": 205, "img_width":141, "img_height":305, "img_x":62, "img_y":187, "layer":0, "image":"kvader2"}
    ]
    // @TODO - dodelat teleport
};

maps["construction_site"] = {
    "name": "construction_site",
    "background": "pozadi",
    "width": 800,
    "height": 600,
    "music": "night_workshift.ogg",
    "images": [
        {"file": "l4.pozadi.png", "name": "pozadi", "alpha": "no"},
        {"file": "l4.bagr.png", "name": "bagr", "alpha": "yes"},
        {"file": "l4.pytle.png", "name": "pytle", "alpha": "yes"},
        {"file": "l4.tvarnice.png", "name": "tvarnice", "alpha": "yes"},
        {"file": "l4.palety.png", "name": "palety", "alpha": "yes"},
        {"file": "l4.overlay.png", "name": "overlay", "alpha": "yes"}
    ],
    "walls": [
        {"x": 96, "y": 423, "width": 162, "height": 96, "img_width":198, "img_height":294, "img_x":86, "img_y":235, "layer":0, "image":"bagr"},
        {"x": 425, "y": 358, "width": 120, "height": 55, "img_width":151, "img_height":90, "img_x":410, "img_y":326, "layer":0, "image":"pytle"},
        {"x": 55, "y": 52, "width": 62, "height": 87, "img_width":71, "img_height":105, "img_x":51, "img_y":37, "layer":0, "image":"tvarnice"},
        {"x": 92, "y": 0, "width": 198, "height": 118, "img_width":229, "img_height":101, "img_x":65, "img_y":0, "layer":0, "image":"palety"},
        {"img_width":800, "img_height":600, "img_x":0, "img_y":0, "layer":1, "image":"overlay"}
    ]
};

maps["night_workshift"] = {
    "name": "night_workshift",
    "background": "pitch",
    "width": 800,
    "height": 600,
    "music": "night_workshift.ogg",
    "images": [
        {"file": "l2.pitch.png", "name": "pitch", "alpha": "no"},
        {"file": "l2.potrubi.png", "name": "potrubi", "alpha": "yes"},
        {"file": "l2.retez.png", "name": "retez", "alpha": "yes"},
        {"file": "l2.barel.png", "name": "barel", "alpha": "yes"},
        {"file": "l2.nadrz.png", "name": "nadrz", "alpha": "yes"},
        {"file": "l2.trubky.png", "name": "trubky", "alpha": "yes"},
        {"file": "l2.trubka2.png", "name": "trubka2", "alpha": "yes"},
        {"file": "l2.trubka6.png", "name": "trubka6", "alpha": "yes"},
        {"file": "l2.trubka4.png", "name": "trubka4", "alpha": "yes"},
        {"file": "l2.trubka8.png", "name": "trubka8", "alpha": "yes"},
    ],
    "walls": [
        {"img_width":243, "img_height":239, "img_x":0, "img_y":366, "layer":1, "image":"potrubi"},
        {"img_width":406, "img_height":271, "img_x":393, "img_y":0, "layer":1, "image":"retez"},
        {"x": 535, "y": 480, "width": 175, "height": 31, "img_width":180, "img_height":91, "img_x":531, "img_y":421, "layer":0, "image":"barel"},
        {"x": 333, "y": 66, "width": 287, "height": 98, "img_width":284, "img_height":179, "img_x":331, "img_y":2, "layer":0, "image":"nadrz"},
        {"x": 125, "y": 318, "width": 37, "height": 162, "img_width":85, "img_height":159, "img_x":106, "img_y":320, "layer":0, "image":"trubky"},
        // pipes - @TODO - dodelat prochazeni trubek viz. arena.map
        {"x": 187, "y": 0, "width": 50, "height": 100, "img_width":50, "img_height":100, "img_x":187, "img_y":0, "layer":0, "image":"trubka2"},
        {"x": 0, "y": 187, "width": 100, "height": 50, "img_width":100, "img_height":50, "img_x":0, "img_y":187, "layer":0, "image":"trubka6"},
        {"x": 737, "y": 312, "width": 100, "height": 50, "img_width":100, "img_height":50, "img_x":737, "img_y":312, "layer":0, "image":"trubka4"},
        {"x": 400, "y": 500, "width": 50, "height": 100, "img_width":50, "img_height":100, "img_x":400, "img_y":500, "layer":0, "image":"trubka8"},
    ]
};