==============================
Quick Test with Demo Scripts
==============================

The page explains how you can test the GiottoDataViewer with minimal steps.

#. Install BuildingDepot
#. Copy pythons scripts in demo_script folder to a server hosting BuildingDepot.
#. Run add_demo_sensors.py to register sensors in BuildingDepot.
#. Run dummy_sensor.py. This script sends dummy data to BuildingDepot.

#. Build GiottoDataViewer as described in :doc:`../contents/build`.
#. Configure BuidingDepot parameters in the iOS app as described in :doc:`../contents/setup`.
#. Put *Room1* in the location emulation in the Setting tab of GiottoDataViwer
#. You should see a list of devices in the Devices tab. If it does not work, check the Log tab to see what is the problem.

