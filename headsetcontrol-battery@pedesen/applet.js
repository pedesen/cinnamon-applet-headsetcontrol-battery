const Applet = imports.ui.applet;
const GLib = imports.gi.GLib;
const Mainloop = imports.mainloop;
const Lang = imports.lang;

function HeadsetcontrolBattery(orientation, panel_height, instance_id) {
  this._init(orientation, panel_height, instance_id);
}

HeadsetcontrolBattery.prototype = {
  __proto__: Applet.TextApplet.prototype,

  _init: function (orientation, panel_height, instance_id) {
    Applet.TextApplet.prototype._init.call(
      this,
      orientation,
      panel_height,
      instance_id
    );

    this.set_applet_tooltip(_("Battery Status"));
    this.set_applet_label("--");
    this._update_loop();
  },

  on_applet_removed_from_panel: function () {
    if (this._updateLoopID) {
      Mainloop.source_remove(this._updateLoopID);
    }
  },

  _run_cmd: function (command) {
    try {
      let [result, stdout, stderr] = GLib.spawn_command_line_sync(command);
      if (stdout != null) {
        return stdout.toString();
      }
    } catch (e) {
      global.logError(e);
    }

    return "";
  },

  _get_status: function () {
    const response = this._run_cmd("headsetcontrol -b");
    const status = response.match(/Battery: (.*)/)[1];

    this.set_applet_label(status === "Charging" ? "Chg" : status);
    this.set_applet_tooltip(_(`Battery: ${status}`));
  },

  _update_loop: function () {
    this._get_status();
    this._updateLoopID = Mainloop.timeout_add(
      5000,
      Lang.bind(this, this._update_loop)
    );
  },
};

function main(metadata, orientation, panel_height, instance_id) {
  return new HeadsetcontrolBattery(orientation, panel_height, instance_id);
}
