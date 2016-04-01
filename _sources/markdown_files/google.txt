You need to replace the CLIENT\_ID in index.html to your own. To do
that, you should set up the related Google API in the `Google Developers
Console <https://console.developers.google.com>`__. Specifically, the
follow three APIs:

**Google Maps JavaScript API** to load a Google map.

**Google Maps Directions API** to calculate the estimated arrival time.

**Calendar API** to pull out events from the presenter of the demo.

In your console, create a project with any name you like, and enable the
above three API in the "Enable and manage APIs" card. |alt tag|

You will be redirected to a page called\*\* API Manager\*\*. In this
page, search keywords to bring up the API needed. In the example below,
search "calendar" for the Calendar API.

.. figure:: https://googledrive.com/host/0B3jZo6rKlGb4WlFkTHRmaXcwRFk/2.png
   :alt: alt tag

   alt tag

Finally, enable it. It usually takes 4-5 seconds to be enabled.

.. figure:: https://googledrive.com/host/0B3jZo6rKlGb4WlFkTHRmaXcwRFk/3.png
   :alt: alt tag

   alt tag

Do this for all the required APIs, and you should be good to go.

To get the CLIENT\_ID, you can go to the API Manager of your project,
click **Credentials**, and you will find the CLIENT\_ID in the section
**OAuth 2.0 client IDs**.

The Dashboard page will be posting data to the BuildingDepot server,
therefore, you need to install the "Allow Control Allow Origin"
extension in your Chrome to enable cross domain ajax.

.. figure:: https://googledrive.com/host/0B3jZo6rKlGb4WlFkTHRmaXcwRFk/5.png
   :alt: alt tag

   alt tag

Remember to enable the extension before the demo, and turn it off after
the demo. Otherwise you might have issues while normal web browsing.
|alt tag|

.. |alt tag| image:: https://googledrive.com/host/0B3jZo6rKlGb4WlFkTHRmaXcwRFk/1.png
.. |alt tag| image:: https://googledrive.com/host/0B3jZo6rKlGb4WlFkTHRmaXcwRFk/6.png
