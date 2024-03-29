"use strict";

$(function () {
    // blur after a nav click
    $("a.covert, nav a").focus(function () {
        $(this).blur();
    });

    waitForWebfonts(["neuropol"], () => {
        $(".landingtext").fadeIn(1500);
    });
});

window.travelTeams =
    "4eyJyciI46IkR1ZSB0byB5b3VyIHJlY2VudCBhdHRlbmRhbmNlIGFuZCBwZXJmb3JtYW5jZSByZWNvcmRzLCB3ZSBkbyBub3QgYmVsaWV2ZSB0aGF0IHlvdSB3b3VsZCBnYWluIHNpZ25pZmljYW50bHkgZnJvbSBhdHRlbmRpbmcgdGhlIEZSQyB3b3JsZHMgY29tcGV0aXRpb24gaW4gSG91c3Rvbi4gVGhpcyBkZWNpc2lvbiBpbiBubyB3YXkgZGltaW5pc2hlcyB0aGUgdGltZSBhbmQgZWZmb3J0IHlvdSBoYXZlIGRldm90ZWQgdG8gcm9ib3RpY3MsIGFuZCBJIGhvcGUgeW91IHdpbGwgY29udGludWUgdG8gcGxheSBhbiBhY3RpdmUgcm9sZSBvbiB0aGUgcm9ib3RpY3MgdGVhbSBkZXNwaXRlIHRoaXMuIFxuXG5Ib3dldmVyLCB5b3Ugd2lsbCBnYWluIGNvbXBldGl0aW9uIGV4cGVyaWVuY2UgaW4gYXR0ZW5kaW5nIHRoZSBNb250ZXJleSBjb21wZXRpdGlvbi4gSWYgeW91IHN0aWxsIGJlbGlldmUgdGhhdCB5b3Ugd291bGQgZ2FpbiBmcm9tIGFuZCBtYWtlIGEgcG9zaXRpdmUgY29udHJpYnV0aW9uIHRvIHRoZSB0ZWFtIGJ5IHNjb3V0aW5nIGF0IHRoZSBIb3VzdG9uIGNvbXBldGl0aW9uLCBmZWVsIGZyZWUgdG8gc2VuZCBtZSBhbiBlbWFpbCBhdCAyMEZpbm5GQHN0dWRlbnRzLmhhcmtlci5vcmcgd2l0aCBhIGJyaWVmICgzLTUgc2VudGVuY2VzKSBkZXNjcmlwdGlvbiBleHBsYWluaW5nIGJvdGggeW91ciByZWNlbnQgYW5kIHBsYW5uZWQgdGVhbSBjb250cmlidXRpb25zIGFuZCB3aGF0IHlvdSBhbnRpY2lwYXRlIGRvaW5nIGF0IHRoZSBldmVudCBieSBTdW5kYXkgMy8xIGF0IG5vb24uIElmIHlvdSBhZ3JlZSB3aXRoIG91ciBkZWNpc2lvbiwgeW91IG5lZWQgbm90IHJlc3BvbmQuXG5cblRoYW5rcyxcbkZpbm4iLCJhbCI6IkR1ZSB0byB5b3VyIHJlY2VudCBhdHRlbmRhbmNlIGFuZCBwZXJmb3JtYW5jZSByZWNvcmRzLCB3ZSBkbyBub3QgYmVsaWV2ZSB0aGF0IHlvdSB3b3VsZCBnYWluIHNpZ25pZmljYW50bHkgZnJvbSBhdHRlbmRpbmcgdGhlIEZSQyB3b3JsZHMgY29tcGV0aXRpb24gaW4gSG91c3Rvbi4gVGhpcyBkZWNpc2lvbiBpbiBubyB3YXkgZGltaW5pc2hlcyB0aGUgdGltZSBhbmQgZWZmb3J0IHlvdSBoYXZlIGRldm90ZWQgdG8gcm9ib3RpY3MsIGFuZCBJIGhvcGUgeW91IHdpbGwgY29udGludWUgdG8gcGxheSBhbiBhY3RpdmUgcm9sZSBvbiB0aGUgcm9ib3RpY3MgdGVhbSBkZXNwaXRlIHRoaXMuIFxuXG5Ib3dldmVyLCB5b3Ugd2lsbCBnYWluIGNvbXBldGl0aW9uIGV4cGVyaWVuY2UgaW4gYXR0ZW5kaW5nIHRoZSBDZW50cmFsIFZhbGxleSBjb21wZXRpdGlvbi4gSWYgeW91IHN0aWxsIGJlbGlldmUgdGhhdCB5b3Ugd291bGQgZ2FpbiBmcm9tIGFuZCBtYWtlIGEgcG9zaXRpdmUgY29udHJpYnV0aW9uIHRvIHRoZSB0ZWFtIGJ5IHNjb3V0aW5nIGF0IHRoZSBIb3VzdG9uIGNvbXBldGl0aW9uLCBmZWVsIGZyZWUgdG8gc2VuZCBtZSBhbiBlbWFpbCBhdCAyMEZpbm5GQHN0dWRlbnRzLmhhcmtlci5vcmcgd2l0aCBhIGJyaWVmICgzLTUgc2VudGVuY2VzKSBkZXNjcmlwdGlvbiBleHBsYWluaW5nIGJvdGggeW91ciByZWNlbnQgYW5kIHBsYW5uZWQgdGVhbSBjb250cmlidXRpb25zIGFuZCB3aGF0IHlvdSBhbnRpY2lwYXRlIGRvaW5nIGF0IHRoZSBldmVudCBieSBTdW5kYXkgMy8xIGF0IG5vb24uIElmIHlvdSBhZ3JlZSB3aXRoIG91ciBkZWNpc2lvbiwgeW91IG5lZWQgbm90IHJlc3BvbmQuXG5cblRoYW5rcyxcbkZpbm4iLCJhciI6IkR1ZSB0byB5b3VyIHJlY2VudCBhdHRlbmRhbmNlIGFuZCBwZXJmb3JtYW5jZSByZWNvcmRzLCB3ZSBkbyBub3QgYmVsaWV2ZSB0aGF0IHlvdSB3b3VsZCBnYWluIHNpZ25pZmljYW50bHkgZnJvbSBhdHRlbmRpbmcgdGhlIEZSQyB3b3JsZHMgY29tcGV0aXRpb24gaW4gSG91c3Rvbi4gVGhpcyBkZWNpc2lvbiBpbiBubyB3YXkgZGltaW5pc2hlcyB0aGUgdGltZSBhbmQgZWZmb3J0IHlvdSBoYXZlIGRldm90ZWQgdG8gcm9ib3RpY3MsIGFuZCBJIGhvcGUgeW91IHdpbGwgY29udGludWUgdG8gcGxheSBhbiBhY3RpdmUgcm9sZSBvbiB0aGUgcm9ib3RpY3MgdGVhbSBkZXNwaXRlIHRoaXMuIFxuXG5Ib3dldmVyLCB5b3Ugd2lsbCBnYWluIGNvbXBldGl0aW9uIGV4cGVyaWVuY2UgaW4gYXR0ZW5kaW5nIHRoZSBDZW50cmFsIFZhbGxleSBhbmQgTW9udGVyZXkgY29tcGV0aXRpb24uIElmIHlvdSBzdGlsbCBiZWxpZXZlIHRoYXQgeW91IHdvdWxkIGdhaW4gZnJvbSBhbmQgbWFrZSBhIHBvc2l0aXZlIGNvbnRyaWJ1dGlvbiB0byB0aGUgdGVhbSBieSBzY291dGluZyBhdCB0aGUgSG91c3RvbiBjb21wZXRpdGlvbiwgZmVlbCBmcmVlIHRvIHNlbmQgbWUgYW4gZW1haWwgYXQgMjBGaW5uRkBzdHVkZW50cy5oYXJrZXIub3JnIHdpdGggYSBicmllZiAoMy01IHNlbnRlbmNlcykgZGVzY3JpcHRpb24gZXhwbGFpbmluZyBib3RoIHlvdXIgcmVjZW50IGFuZCBwbGFubmVkIHRlYW0gY29udHJpYnV0aW9ucyBhbmQgd2hhdCB5b3UgYW50aWNpcGF0ZSBkb2luZyBhdCB0aGUgZXZlbnQgYnkgU3VuZGF5IDMvMSBhdCBub29uLiBJZiB5b3UgYWdyZWUgd2l0aCBvdXIgZGVjaXNpb24sIHlvdSBuZWVkIG5vdCByZXNwb25kLlxuXG5UaGFua3MsXG5GaW5uIiwiYWMiOiJEdWUgdG8geW91ciByZWNlbnQgYXR0ZW5kYW5jZSBhbmQgcGVyZm9ybWFuY2UgcmVjb3Jkcywgd2UgZG8gbm90IGJlbGlldmUgdGhhdCB5b3Ugd291bGQgZ2FpbiBzaWduaWZpY2FudGx5IGZyb20gYXR0ZW5kaW5nIHRoZSBGUkMgd29ybGRzIGNvbXBldGl0aW9uIGluIEhvdXN0b24uIFRoaXMgZGVjaXNpb24gaW4gbm8gd2F5IGRpbWluaXNoZXMgdGhlIHRpbWUgYW5kIGVmZm9ydCB5b3UgaGF2ZSBkZXZvdGVkIHRvIHJvYm90aWNzLCBhbmQgSSBob3BlIHlvdSB3aWxsIGNvbnRpbnVlIHRvIHBsYXkgYW4gYWN0aXZlIHJvbGUgb24gdGhlIHJvYm90aWNzIHRlYW0gZGVzcGl0ZSB0aGlzLiBcblxuSG93ZXZlciwgeW91IHdpbGwgZ2FpbiBjb21wZXRpdGlvbiBleHBlcmllbmNlIGluIGF0dGVuZGluZyB0aGUgQ2VudHJhbCBWYWxsZXkgYW5kIE1vbnRlcmV5IGNvbXBldGl0aW9uLiBJZiB5b3Ugc3RpbGwgYmVsaWV2ZSB0aGF0IHlvdSB3b3VsZCBnYWluIGZyb20gYW5kIG1ha2UgYSBwb3NpdGl2ZSBjb250cmlidXRpb24gdG8gdGhlIHRlYW0gYnkgc2NvdXRpbmcgYXQgdGhlIEhvdXN0b24gY29tcGV0aXRpb24sIGZlZWwgZnJlZSB0byBzZW5kIG1lIGFuIGVtYWlsIGF0IDIwRmlubkZAc3R1ZGVudHMuaGFya2VyLm9yZyB3aXRoIGEgYnJpZWYgKDMtNSBzZW50ZW5jZXMpIGRlc2NyaXB0aW9uIGV4cGxhaW5pbmcgYm90aCB5b3VyIHJlY2VudCBhbmQgcGxhbm5lZCB0ZWFtIGNvbnRyaWJ1dGlvbnMgYW5kIHdoYXQgeW91IGFudGljaXBhdGUgZG9pbmcgYXQgdGhlIGV2ZW50IGJ5IFN1bmRheSAzLzEgYXQgbm9vbi4gSWYgeW91IGFncmVlIHdpdGggb3VyIGRlY2lzaW9uLCB5b3UgbmVlZCBub3QgcmVzcG9uZC5cblxuVGhhbmtzLFxuRmlubiIsImFmIjoiRHVlIHRvIHlvdXIgcmVjZW50IGF0dGVuZGFuY2UgYW5kIHBlcmZvcm1hbmNlIHJlY29yZHMsIHdlIGRvIG5vdCBiZWxpZXZlIHRoYXQgeW91IHdvdWxkIGdhaW4gc2lnbmlmaWNhbnRseSBmcm9tIGF0dGVuZGluZyB0aGUgRlJDIHdvcmxkcyBjb21wZXRpdGlvbiBpbiBIb3VzdG9uLiBUaGlzIGRlY2lzaW9uIGluIG5vIHdheSBkaW1pbmlzaGVzIHRoZSB0aW1lIGFuZCBlZmZvcnQgeW91IGhhdmUgZGV2b3RlZCB0byByb2JvdGljcywgYW5kIEkgaG9wZSB5b3Ugd2lsbCBjb250aW51ZSB0byBwbGF5IGFuIGFjdGl2ZSByb2xlIG9uIHRoZSByb2JvdGljcyB0ZWFtIGRlc3BpdGUgdGhpcy4gXG5cbkhvd2V2ZXIsIHlvdSB3aWxsIGdhaW4gY29tcGV0aXRpb24gZXhwZXJpZW5jZSBpbiBhdHRlbmRpbmcgdGhlIENlbnRyYWwgVmFsbGV5IGFuZCBNb250ZXJleSBjb21wZXRpdGlvbi4gSWYgeW91IHN0aWxsIGJlbGlldmUgdGhhdCB5b3Ugd291bGQgZ2FpbiBmcm9tIGFuZCBtYWtlIGEgcG9zaXRpdmUgY29udHJpYnV0aW9uIHRvIHRoZSB0ZWFtIGJ5IHNjb3V0aW5nIGF0IHRoZSBIb3VzdG9uIGNvbXBldGl0aW9uLCBmZWVsIGZyZWUgdG8gc2VuZCBtZSBhbiBlbWFpbCBhdCAyMEZpbm5GQHN0dWRlbnRzLmhhcmtlci5vcmcgd2l0aCBhIGJyaWVmICgzLTUgc2VudGVuY2VzKSBkZXNjcmlwdGlvbiBleHBsYWluaW5nIGJvdGggeW91ciByZWNlbnQgYW5kIHBsYW5uZWQgdGVhbSBjb250cmlidXRpb25zIGFuZCB3aGF0IHlvdSBhbnRpY2lwYXRlIGRvaW5nIGF0IHRoZSBldmVudCBieSBTdW5kYXkgMy8xIGF0IG5vb24uIElmIHlvdSBhZ3JlZSB3aXRoIG91ciBkZWNpc2lvbiwgeW91IG5lZWQgbm90IHJlc3BvbmQuXG5cblRoYW5rcyxcbkZpbm4iLCJzciI6IkkgYW0gc29ycnkgdG8gbGV0IHlvdSBrbm93IHRoYXQgd2Ugd2lsbCBiZSB1bmFibGUgdG8gYWNjb21tb2RhdGUgeW91IG9uIHRoZSB0cmF2ZWwgdGVhbSBmb3IgdGhlIEhvdXN0b24gY2hhbXBpb25zaGlwLiBXZSBoYWQgdG8gbWFrZSBzZXZlcmFsIGNoYWxsZW5naW5nIGRlY2lzaW9ucywgYW5kIHlvdSB1bmZvcnR1bmF0ZWx5IGRpZCBub3QgbWVldCB0aGUgYXR0ZW5kYW5jZSBiZW5jaG1hcmsgcmVxdWlyZWQgZm9yIHRoZSBldmVudC4gV2UgcGxhY2VkIHNpZ25pZmljYW50IGVtcGhhc2lzIG9uIHBhc3QgY29tcGV0aXRpb24gYXR0ZW5kYW5jZTsgYmVjYXVzZSB5b3Ugd2VyZSB1bmFibGUgdG8gYXR0ZW5kIGVpdGhlciBDZW50cmFsIFZhbGxleSBvciBNb250ZXJleSwgd2UgZG8gbm90IGJlbGlldmUgeW91IHdvdWxkIGdhaW4gc2lnbmlmaWNhbnRseSBmcm9tIGF0dGVuZGluZyB0aGUgSG91c3RvbiBjb21wZXRpdGlvbi5cblxuVGhpcyBkZWNpc2lvbiBpbiBubyB3YXkgZGltaW5pc2hlcyB0aGUgdGltZSBhbmQgZWZmb3J0IHlvdSBoYXZlIGRldm90ZWQgdG8gcm9ib3RpY3MsIGFuZCBJIGhvcGUgeW91IHdpbGwgY29udGludWUgdG8gcGxheSBhbiBhY3RpdmUgcm9sZSBvbiB0aGUgcm9ib3RpY3MgdGVhbS4gSSB3aXNoIHlvdSBhbGwgdGhlIGJlc3QsIGFuZCBJIGhvcGUgdGhhdCB0aGlzIG1lc3NhZ2UgZG9lcyBub3QgZGlzc3VhZGUgeW91IGZyb20gZnVydGhlciBwdXJzdWluZyB5b3VyIHBhc3Npb24gZm9yIHJvYm90aWNzLlxuXG5GaW5uIiwiYWoiOiJJIGFtIHNvcnJ5IHRvIGxldCB5b3Uga25vdyB0aGF0IHdlIHdpbGwgYmUgdW5hYmxlIHRvIGFjY29tbW9kYXRlIHlvdSBvbiB0aGUgdHJhdmVsIHRlYW0gZm9yIHRoZSBIb3VzdG9uIGNoYW1waW9uc2hpcC4gV2UgaGFkIHRvIG1ha2Ugc2V2ZXJhbCBjaGFsbGVuZ2luZyBkZWNpc2lvbnMsIGFuZCB5b3UgdW5mb3J0dW5hdGVseSBkaWQgbm90IG1lZXQgdGhlIGF0dGVuZGFuY2UgYmVuY2htYXJrIHJlcXVpcmVkIGZvciB0aGUgZXZlbnQuIFdlIHBsYWNlZCBzaWduaWZpY2FudCBlbXBoYXNpcyBvbiBwYXN0IGNvbXBldGl0aW9uIGF0dGVuZGFuY2U7IGJlY2F1c2UgeW91IHdlcmUgdW5hYmxlIHRvIGF0dGVuZCBlaXRoZXIgQ2VudHJhbCBWYWxsZXkgb3IgTW9udGVyZXksIHdlIGRvIG5vdCBiZWxpZXZlIHlvdSB3b3VsZCBnYWluIHNpZ25pZmljYW50bHkgZnJvbSBhdHRlbmRpbmcgdGhlIEhvdXN0b24gY29tcGV0aXRpb24uXG5cblRoaXMgZGVjaXNpb24gaW4gbm8gd2F5IGRpbWluaXNoZXMgdGhlIHRpbWUgYW5kIGVmZm9ydCB5b3UgaGF2ZSBkZXZvdGVkIHRvIHJvYm90aWNzLCBhbmQgSSBob3BlIHlvdSB3aWxsIGNvbnRpbnVlIHRvIHBsYXkgYW4gYWN0aXZlIHJvbGUgb24gdGhlIHJvYm90aWNzIHRlYW0uIEkgd2lzaCB5b3UgYWxsIHRoZSBiZXN0LCBhbmQgSSBob3BlIHRoYXQgdGhpcyBtZXNzYWdlIGRvZXMgbm90IGRpc3N1YWRlIHlvdSBmcm9tIGZ1cnRoZXIgcHVyc3VpbmcgeW91ciBwYXNzaW9uIGZvciByb2JvdGljcy5cblxuRmlubiIsInNnIjoiSSBhbSBzb3JyeSB0byBsZXQgeW91IGtub3cgdGhhdCB3ZSB3aWxsIGJlIHVuYWJsZSB0byBhY2NvbW1vZGF0ZSB5b3Ugb24gdGhlIHRyYXZlbCB0ZWFtIGZvciB0aGUgSG91c3RvbiBjaGFtcGlvbnNoaXAuIFdlIGhhZCB0byBtYWtlIHNldmVyYWwgY2hhbGxlbmdpbmcgZGVjaXNpb25zLCBhbmQgeW91IHVuZm9ydHVuYXRlbHkgZGlkIG5vdCBtZWV0IHRoZSBhdHRlbmRhbmNlIGJlbmNobWFyayByZXF1aXJlZCBmb3IgdGhlIGV2ZW50LiBXZSBwbGFjZWQgc2lnbmlmaWNhbnQgZW1waGFzaXMgb24gcGFzdCBjb21wZXRpdGlvbiBhdHRlbmRhbmNlOyBiZWNhdXNlIHlvdSB3ZXJlIHVuYWJsZSB0byBhdHRlbmQgZWl0aGVyIENlbnRyYWwgVmFsbGV5IG9yIE1vbnRlcmV5LCB3ZSBkbyBub3QgYmVsaWV2ZSB5b3Ugd291bGQgZ2FpbiBzaWduaWZpY2FudGx5IGZyb20gYXR0ZW5kaW5nIHRoZSBIb3VzdG9uIGNvbXBldGl0aW9uLlxuXG5UaGlzIGRlY2lzaW9uIGluIG5vIHdheSBkaW1pbmlzaGVzIHRoZSB0aW1lIGFuZCBlZmZvcnQgeW91IGhhdmUgZGV2b3RlZCB0byByb2JvdGljcywgYW5kIEkgaG9wZSB5b3Ugd2lsbCBjb250aW51ZSB0byBwbGF5IGFuIGFjdGl2ZSByb2xlIG9uIHRoZSByb2JvdGljcyB0ZWFtLiBJIHdpc2ggeW91IGFsbCB0aGUgYmVzdCwgYW5kIEkgaG9wZSB0aGF0IHRoaXMgbWVzc2FnZSBkb2VzIG5vdCBkaXNzdWFkZSB5b3UgZnJvbSBmdXJ0aGVyIHB1cnN1aW5nIHlvdXIgcGFzc2lvbiBmb3Igcm9ib3RpY3MuXG5cbkZpbm4iLCJhIjoiQ29uZ3JhdHVsYXRpb25zISBZb3Ugd2VyZSBjaG9zZW4gdG8gYmUgcGFydCBvZiB0aGUgdHJhdmVsIHRlYW0gZm9yIHRoZSBGUkMgd29ybGQgY2hhbXBpb25zaGlwIGV2ZW50IGluIEhvdXN0b24uIFdlIGhhZCB0byBtYWtlIHNldmVyYWwgY2hhbGxlbmdpbmcgZGVjaXNpb25zLCBidXQgeW91ciBhdHRlbmRhbmNlIHNpZ25pZmljYW50bHkgc3VycGFzc2VkIHRoZSByZXF1aXJlZCBiZW5jaG1hcmsuXG5cblBlcm1pc3Npb24gc2xpcHMgaGF2ZSBub3QgeWV0IGJlZW4gcHVibGlzaGVkIC0tIHdlIHdpbGwgcmVsZWFzZSB0aGVtIG9ubHkgYWZ0ZXIgZXhwbGljaXQgcXVhbGlmaWNhdGlvbi4gUGxlYXNlIGtlZXAgeW91ciBleWVzIG9wZW4gZm9yIGEgZnV0dXJlIGVtYWlsIGNvbnRhaW5pbmcgdGhlIHNsaXBzLiBZb3UgZG8gbm90IG5lZWQgdG8gZWRpdCB0aGUgcm9vbW1hdGUgc2VsZWN0aW9uIGZvcm0sIGlmIGFueSBtb2RpZmljYXRpb25zIGhhdmUgYmVlbiBtYWRlIHRvIHlvdXIgcm9vbSBsaXN0LCB5b3Ugd2lsbCBiZSBpbmZvcm1lZCBvdmVyIHRoZSB1cGNvbWluZyB3ZWVrLlxuXG5Mb29raW5nIGZvcndhcmQgdG8gdGhlIGNvbXBldGl0aW9uIHNlYXNvbiFcbkZpbm4ifQ";
window.travelTeamData =
    "keyIyMnJ4vaGFuckBzdHVkZW50cy5oYXJrZXIub3JnIjoicnIiLCIyMmFpZGFubEBzdHVkZW50cy5oYXJrZXIub3JnIjoiYWwiLCIyMmFuaXNoa2FyQHN0dWRlbnRzLmhhcmtlci5vcmciOiJhciIsIjIxYW5nZWxhY0BzdHVkZW50cy5oYXJrZXIub3JnIjoiYWMiLCIyMmFsaWNlZkBzdHVkZW50cy5oYXJrZXIub3JnIjoiYWYiLCIyMHNoYWxpbmlyQHN0dWRlbnRzLmhhcmtlci5vcmciOiJzciIsIjIzYXJpYWpAc3R1ZGVudHMuaGFya2VyLm9yZyI6ImFqIiwiMjBzYWhpbGdAc3R1ZGVudHMuaGFya2VyLm9yZyI6InNnIiwiMjFjaGxvZWFAc3R1ZGVudHMuaGFya2VyLm9yZyI6ImEiLCIyMWhhcmliQHN0dWRlbnRzLmhhcmtlci5vcmciOiJhIiwiMjNlbW1hYkBzdHVkZW50cy5oYXJrZXIub3JnIjoiYSIsIjIyZXRoYW5jQHN0dWRlbnRzLmhhcmtlci5vcmciOiJhIiwiMjNicmlhbmNAc3R1ZGVudHMuaGFya2VyLm9yZyI6ImEiLCIyMnphY2hjQHN0dWRlbnRzLmhhcmtlci5vcmciOiJhIiwiMjJhcmp1bmRAc3R1ZGVudHMuaGFya2VyLm9yZyI6ImEiLCIyMGZpbm5mQHN0dWRlbnRzLmhhcmtlci5vcmciOiJhIiwiMjJhZGhlZXRnQHN0dWRlbnRzLmhhcmtlci5vcmciOiJhIiwiMjJkZW5uaXNnQHN0dWRlbnRzLmhhcmtlci5vcmciOiJhIiwiMjJzaG91bmFrZ0BzdHVkZW50cy5oYXJrZXIub3JnIjoiYSIsIjIycHJhbmF2Z0BzdHVkZW50cy5oYXJrZXIub3JnIjoiYSIsIjIycHJha3JpdGpAc3R1ZGVudHMuaGFya2VyLm9yZyI6ImEiLCIyMWFydGh1cmpAc3R1ZGVudHMuaGFya2VyLm9yZyI6ImEiLCIyMmFuZ2llakBzdHVkZW50cy5oYXJrZXIub3JnIjoiYSIsIjIzbGF1cmllakBzdHVkZW50cy5oYXJrZXIub3JnIjoiYSIsIjIyY2hpcmFna0BzdHVkZW50cy5oYXJrZXIub3JnIjoiYSIsIjIwamF0aW5rQHN0dWRlbnRzLmhhcmtlci5vcmciOiJhIiwiMjJhbmlydWRoa0BzdHVkZW50cy5oYXJrZXIub3JnIjoiYSIsIjIxYW5raXRha0BzdHVkZW50cy5oYXJrZXIub3JnIjoiYSIsIjIyc2hhaHplYmxAc3R1ZGVudHMuaGFya2VyLm9yZyI6ImEiLCIyMmFsZXhsQHN0dWRlbnRzLmhhcmtlci5vcmciOiJhIiwiMjJrYXRlb0BzdHVkZW50cy5oYXJrZXIub3JnIjoiYSIsIjIyYW5pc2hwQHN0dWRlbnRzLmhhcmtlci5vcmciOiJhIiwiMjNhZGFwQHN0dWRlbnRzLmhhcmtlci5vcmciOiJhIiwiMjBzYW5qYXlyQHN0dWRlbnRzLmhhcmtlci5vcmciOiJhIiwiMjNhcml5YXJAc3R1ZGVudHMuaGFya2VyLm9yZyI6ImEiLCIyMHJvaGFuc0BzdHVkZW50cy5oYXJrZXIub3JnIjoiYSIsIjIxYXlkaW50QHN0dWRlbnRzLmhhcmtlci5vcmciOiJhIiwiMjJtaWNoYWVsdEBzdHVkZW50cy5oYXJrZXIub3JnIjoiYSIsIjIycHJhbmF2dkBzdHVkZW50cy5oYXJrZXIub3JnIjoiYSIsIjIxYWRpdGl2QHN0dWRlbnRzLmhhcmtlci5vcmciOiJhIiwiMjJhaW1lZXdAc3R1ZGVudHMuaGFya2VyLm9yZyI6ImEiLCIyMmNvbm5vcndAc3R1ZGVudHMuaGFya2VyLm9yZyI6ImEiLCIyMmFsaW5heUBzdHVkZW50cy5oYXJrZXIub3JnIjoiYSIsIjIyZ2xvcmlhekBzdHVkZW50cy5oYXJrZXIub3JnIjoiYSJ9";
window.decode = function (x) {
    return JSON.parse(atob(x.substring(1, 8) + x.substring(9)));
};

function waitForWebfonts(fonts, callback) {
    var loadedFonts = 0;
    for (var i = 0, l = fonts.length; i < l; ++i) {
        (function (font) {
            var node = document.createElement("span");
            // Characters that vary significantly among different fonts
            node.innerHTML = "giItT1WQy@!-/#";
            // Visible - so we can measure it - but not on the screen
            node.style.position = "absolute";
            node.style.left = "-10000px";
            node.style.top = "-10000px";
            // Large font size makes even subtle changes obvious
            node.style.fontSize = "300px";
            // Reset any font properties
            node.style.fontFamily = "sans-serif";
            node.style.fontVariant = "normal";
            node.style.fontStyle = "normal";
            node.style.fontWeight = "normal";
            node.style.letterSpacing = "0";
            document.body.appendChild(node);

            // Remember width with no applied web font
            var width = node.offsetWidth;

            node.style.fontFamily = font;

            var interval;
            function checkFont() {
                // Compare current width with original width
                if (node && node.offsetWidth != width) {
                    ++loadedFonts;
                    node.parentNode.removeChild(node);
                    node = null;
                }

                // If all fonts have been loaded
                if (loadedFonts >= fonts.length) {
                    if (interval) {
                        clearInterval(interval);
                    }
                    if (loadedFonts == fonts.length) {
                        callback();
                        return true;
                    }
                }
            }

            if (!checkFont()) {
                interval = setInterval(checkFont, 50);
            }
        })(fonts[i]);
    }
}

function handleXHRError(xhr) {
    console.error(xhr);
    if (xhr && xhr.responseJSON && xhr.responseJSON.error)
        alert(xhr.responseJSON.error.message);
    else if (xhr && xhr.responseJSON) {
        alert("An error occured.");
        console.error(xhr.responseJSON.error);
    } else if (xhr && xhr.responseText) {
        alert("An error occured.");
        console.error(xhr.responseText);
    }
}
