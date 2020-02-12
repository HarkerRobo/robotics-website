'use strict'

$(function() {

  // blur after a nav click
  $('a.covert, nav a').focus(function(){
    $(this).blur()
  })

  waitForWebfonts(['neuropol'], () => {
    $('.landingtext').fadeIn(1500)
  })

})

window.roles = "leyJwaXQiOiJZb3UgaGF2ZSBiZWVuIHNlbGVjdGVkIGZvciB0aGUgcm9sZSBvZiBwaXQgY3Jldy4gWW91IHdpbGwgYmUgaW4gb3VyIHRlYW0ncyBwaXQgZHVyaW5nIHRoZSBjb21wZXRpdGlvbiwgd2hlcmUgeW91IHdpbGwgd29yayBvbiBhbnkgbmVjZXNzYXJ5IHJlcGFpcnMgb3IgaW1wcm92ZW1lbnRzIGFmdGVyIGVhY2ggbWF0Y2guIFlvdSBtYXkgYWxzbyBoZWxwIGluIHRlc3RpbmcgdGhlIHJvYm90IG9yIHByZXBhcmluZyBpdCBiZWZvcmUgYSBtYXRjaC4gV2Ugd2lsbCBiZSBwdWJsaWNpemluZyBhIHNwZWNpZmljIHBpdCBzY2hlZHVsZSBjbG9zZXIgdG8gdGhlIGRhdGUgb2YgdGhlIGV2ZW50LiBXaGVuIHlvdSBhcmUgbm90IGluIHRoZSBwaXQsIHlvdSBtYXkgb3B0aW9uYWxseSBvZmZlciBhc3Npc3RhbmNlIHdpdGggc2NvdXRpbmcgdG8gcHJvdmlkZSB1cyB3aXRoIGFkZGl0aW9uYWwgZGF0YSBwb2ludHMuIFlvdSBhcmUgYWxzbyBlbGlnaWJsZSB0byB0cnkgb3V0IHRvIGJlIHBhcnQgb2YgdGhlIGRyaXZlIHRlYW0uIERyaXZlciB0cnlvdXRzIHdpbGwgYmUgaGVsZCBuZXh0IHdlZWssIGFuZCBhbiBlbWFpbCB3aWxsIGJlIGdvaW5nIG91dCBzb29uIHdpdGggbW9yZSBkZXRhaWxzLiIsInNjb3V0IjoiWW91IGhhdmUgYmVlbiBzZWxlY3RlZCBmb3IgdGhlIHJvbGUgb2Ygc2NvdXQuIFlvdSB3aWxsIGJlIGNvbGxlY3RpbmcgZGF0YSBvbiBtYXRjaGVzIHVzaW5nIHRoZSBzY291dGluZyBhcHAgZHVyaW5nIGNvbXBldGl0aW9ucy4gV2Ugd2lsbCB1c2UgdGhpcyBkYXRhIHRvIGZvcm11bGF0ZSBtYXRjaCBzdHJhdGVneSBhbmQgdG8gc2VsZWN0IHRoZSBpZGVhbCByb2JvdCB0byBqb2luIG91ciBhbGxpYW5jZSBkdXJpbmcgZWxpbWluYXRpb24gbWF0Y2hlcy4gUGxlYXNlIGZpbGwgb3V0IHRoZSBmb3JtIGhlcmUgdG8gc2lnbiB1cCBmb3IgYSB0cmFpbmluZyBzbG90OiByb2JvdGljcy5oYXJrZXIub3JnL3Njb3V0ZXJ0cmFpbmluZy4gWW91IGFyZSBhbHNvIGVsaWdpYmxlIHRvIHRyeSBvdXQgdG8gYmUgcGFydCBvZiB0aGUgZHJpdmUgdGVhbS4gRHJpdmVyIHRyeW91dHMgd2lsbCBiZSBoZWxkIG5leHQgd2VlaywgYW5kIGFuIGVtYWlsIHdpbGwgYmUgZ29pbmcgb3V0IHNvb24gd2l0aCBtb3JlIGRldGFpbHMuIiwic3VwZXJzY291dCI6IllvdSBoYXZlIGJlZW4gc2VsZWN0ZWQgZm9yIHRoZSByb2xlIG9mIHN1cGVyIHNjb3V0LiBZb3Ugd2lsbCBiZSB3YXRjaGluZyBhIGxhcmdlIG1ham9yaXR5IChvciBhbGwpIG9mIG91ciBtYXRjaGVzIGFuZCBjb2xsZWN0aW5nIHF1YWxpdGF0aXZlIGFuZCBzdWJqZWN0aXZlIGRhdGEgLS0gbm90IHVzaW5nIHRoZSBzY291dGluZyBhcHAuIFRoaXMgd2lsbCBoZWxwIHlvdSBpbiB1bmRlcnN0YW5kaW5nIHRoZSBib3RzIHZlcnkgd2VsbCBzbyB0aGF0IHlvdSBjYW4gaGVscCB1cyB0byBkZWNpZGUgd2hpY2ggcm9ib3RzIHdlIHdpbGwgc2VsZWN0IGZvciBvdXIgcGxheW9mZiBhbGxpYW5jZSBpbiB0aGUgZWxpbWluYXRpb24gbWF0Y2hlcy4gVGhpcyB3aWxsIGFsc28gaGVscCB1cyB0byByZWZpbmUgb3VyIG1hdGNoIHN0cmF0ZWd5IHRvIGNvdW50ZXIgb3RoZXIgYm90cyBkdXJpbmcgb3VyIG1hdGNoZXMuIn0";
window.rolesData = "9eyIyMWF5ZGludEBzdHVkZW50cy5oYXJrZXIub3JnIjoic2NvdXQiLCIyMWFuZ2VsYWNAc3R1ZGVudHMuaGFya2VyLm9yZyI6InNjb3V0IiwiMjJzaG91bmFrZ0BzdHVkZW50cy5oYXJrZXIub3JnIjoic2NvdXQiLCIyMm1pY2hhZWx0QHN0dWRlbnRzLmhhcmtlci5vcmciOiJzY291dCIsIjIzbGF1cmllakBzdHVkZW50cy5oYXJrZXIub3JnIjoic2NvdXQiLCIyMmFuaXNoa2FyQHN0dWRlbnRzLmhhcmtlci5vcmciOiJzY291dCIsIjIyYWxpbmF5QHN0dWRlbnRzLmhhcmtlci5vcmciOiJzY291dCIsIjIyYWlkYW5sQHN0dWRlbnRzLmhhcmtlci5vcmciOiJzY291dCIsIjIzd2lsbGxAc3R1ZGVudHMuaGFya2VyLm9yZyI6InNjb3V0IiwiMjJldGhhbmhAc3R1ZGVudHMuaGFya2VyLm9yZyI6InNjb3V0IiwiMjNnYXJ5ZEBzdHVkZW50cy5oYXJrZXIub3JnIjoic2NvdXQiLCIyM2FkYXBAc3R1ZGVudHMuaGFya2VyLm9yZyI6InN1cGVyc2NvdXQiLCIyMmFsaWNlZkBzdHVkZW50cy5oYXJrZXIub3JnIjoic3VwZXJzY291dCIsIjIyYWltZWV3QHN0dWRlbnRzLmhhcmtlci5vcmciOiJzdXBlcnNjb3V0IiwiMjJhZGhlZXRnQHN0dWRlbnRzLmhhcmtlci5vcmciOiJwaXQiLCIyMnByYW5hdnZAc3R1ZGVudHMuaGFya2VyLm9yZyI6InBpdCIsIjIyY29ubm9yd0BzdHVkZW50cy5oYXJrZXIub3JnIjoicGl0IiwiMjNhcml5YXJAc3R1ZGVudHMuaGFya2VyLm9yZyI6InBpdCIsIjIyYW5pc2hwQHN0dWRlbnRzLmhhcmtlci5vcmciOiJwaXQiLCIyMmFuaXJ1ZGhrQHN0dWRlbnRzLmhhcmtlci5vcmciOiJwaXQiLCIyMmFyanVuZEBzdHVkZW50cy5oYXJrZXIub3JnIjoicGl0IiwiMjJzaGFoemVibEBzdHVkZW50cy5oYXJrZXIub3JnIjoicGl0IiwiMjJjaGlyYWdrQHN0dWRlbnRzLmhhcmtlci5vcmciOiJwaXQiLCIyMnphY2hjQHN0dWRlbnRzLmhhcmtlci5vcmciOiJwaXQiLCIyMnByYWtyaXRqQHN0dWRlbnRzLmhhcmtlci5vcmciOiJwaXQiLCIyMWFkaXRpdkBzdHVkZW50cy5oYXJrZXIub3JnIjoicGl0IiwiMjJwcmFuYXZnQHN0dWRlbnRzLmhhcmtlci5vcmciOiJwaXQiLCIyMmthdGVvQHN0dWRlbnRzLmhhcmtlci5vcmciOiJwaXQiLCIyMHF1ZW50aW5jQHN0dWRlbnRzLmhhcmtlci5vcmciOiJwaXQiLCIyMmV0aGFuY0BzdHVkZW50cy5oYXJrZXIub3JnIjoicGl0IiwiMjJkZW5uaXNnQHN0dWRlbnRzLmhhcmtlci5vcmciOiJwaXQiLCIyMHJvaGFuc0BzdHVkZW50cy5oYXJrZXIub3JnIjoicGl0IiwiMjFjaGxvZWFAc3R1ZGVudHMuaGFya2VyLm9yZyI6InBpdCIsIjIxYXJ0aHVyakBzdHVkZW50cy5oYXJrZXIub3JnIjoicGl0IiwiMjFhbmtpdGFrQHN0dWRlbnRzLmhhcmtlci5vcmciOiJwaXQiLCIyMmFsZXhsQHN0dWRlbnRzLmhhcmtlci5vcmciOiJwaXQiLCIyMmdsb3JpYXpAc3R1ZGVudHMuaGFya2VyLm9yZyI6InBpdCIsIjIwamF0aW5rQHN0dWRlbnRzLmhhcmtlci5vcmciOiJwaXQiLCIyMmFuZ2llakBzdHVkZW50cy5oYXJrZXIub3JnIjoicGl0IiwiMjBmaW5uZkBzdHVkZW50cy5oYXJrZXIub3JnIjoicGl0IiwiMjBzYW5qYXlyQHN0dWRlbnRzLmhhcmtlci5vcmciOiJwaXQiLCIyMWhhcmliQHN0dWRlbnRzLmhhcmtlci5vcmciOiJwaXQifQ";
window.travelTeams = "keyJhIjoiSGVsbG8sXG5cbkkgYW0gcGxlYXNlZCB0byBpbmZvcm0geW91IHRoYXQgeW91IHdlcmUgY2hvc2VuIHRvIGJlIHBhcnQgb2YgdGhlIHRyYXZlbCB0ZWFtIGZvciBNb250ZXJleSBCYXkgUmVnaW9uYWwuIFdlIGhhZCB0byBtYWtlIHNldmVyYWwgY2hhbGxlbmdpbmcgZGVjaXNpb25zLCBidXQgeW91ciBhdHRlbmRhbmNlIHNpZ25pZmljYW50bHkgc3VycGFzc2VkIHRoZSByZXF1aXJlZCBiZW5jaG1hcmsuXG5cbklmIHlvdSBoYXZlIG5vdCB5ZXQgdHVybmVkIGluIHlvdXIgcGVybWlzc2lvbiBzbGlwIGZvciB0aGUgZXZlbnQsIGJlIHN1cmUgdG8gdHVybiBpdCBpbiB0byBEci4gTmVsc29uJ3MgdHVybi1pbiBib3ggYnkgV2VkbmVzZGF5LCBGZWJydWFyeSAxOXRoLiBZb3UgZG8gbm90IG5lZWQgdG8gZWRpdCB0aGUgcm9vbW1hdGUgc2VsZWN0aW9uIGZvcm0uIElmIGFueSBtb2RpZmljYXRpb25zIGhhdmUgYmVlbiBtYWRlIHRvIHlvdXIgcm9vbSBsaXN0LCB5b3Ugd2lsbCBiZSBpbmZvcm1lZCBvdmVyIHRoZSB1cGNvbWluZyB3ZWVrLCBhbG9uZyB3aXRoIHlvdXIgZmluYWxpemVkIHJvbGUgYXQgdGhlIGV2ZW50IChzY291dGluZywgcGl0LCBtZWRpYSwgZXRjLikuIFxuXG5GaW5hbGx5LCBwbGVhc2Ugbm90ZSB0aGF0IHF1YWxpZmljYXRpb24gZm9yIHRoZSBNb250ZXJleSBCYXkgdHJhdmVsIHRlYW0gZG9lcyBub3QgYW1vdW50IHRvIGEgZ3VhcmFudGVlZCBwbGFjZSBvbiB0aGUgSG91c3RvbiB0cmF2ZWwgdGVhbS4gWW91IG11c3Qga2VlcCB1cCB5b3VyIHN0cm9uZyBhdHRlbmRhbmNlIHRvIGVuc3VyZSB5b3VyIHF1YWxpZmljYXRpb24gZm9yIGZ1dHVyZSBldmVudHMuXG5cbkxvb2tpbmcgZm9yd2FyZCB0byB0aGUgY29tcGV0aXRpb24gc2Vhc29uIVxuXG5GaW5uIiwiciI6IkhlbGxvLFxuXG5JIGFtIHNvcnJ5IHRvIGxldCB5b3Uga25vdyB0aGF0IHdlIHdpbGwgYmUgdW5hYmxlIHRvIGFjY29tbW9kYXRlIHlvdSBvbiB0aGUgdHJhdmVsIHRlYW0gZm9yIE1vbnRlcmV5IEJheSBSZWdpb25hbC4gV2UgaGFkIHRvIG1ha2Ugc2V2ZXJhbCBjaGFsbGVuZ2luZyBkZWNpc2lvbnMsIGFuZCB5b3UgdW5mb3J0dW5hdGVseSBkaWQgbm90IG1lZXQgdGhlIGF0dGVuZGFuY2UgYmVuY2htYXJrIHJlcXVpcmVkIGZvciB0aGUgZXZlbnQuIFxuXG5UaGlzIGRlY2lzaW9uIGluIG5vIHdheSBkaW1pbmlzaGVzIHRoZSB0aW1lIGFuZCBlZmZvcnQgeW91IGhhdmUgZGV2b3RlZCB0byByb2JvdGljcywgYW5kIEkgaG9wZSB5b3Ugd2lsbCBjb250aW51ZSB0byBwbGF5IGFuIGFjdGl2ZSByb2xlIG9uIHRoZSByb2JvdGljcyB0ZWFtLiBJZiB5b3UgYXJlIGludGVyZXN0ZWQgaW4gdGFraW5nIGEgbGFyZ2VyIHJvbGUgaW4gSGFya2VyIFJvYm90aWNzIG92ZXIgdGhlIGNvbWluZyB3ZWVrcywgcGxlYXNlIHJlcGx5IHRvIHRoaXMgZW1haWwgYXMgc29vbiBhcyBwb3NzaWJsZSB0byBsZXQgbWUga25vdy4gSWYgeW91IGltcHJvdmUgeW91ciBhdHRlbmRhbmNlIGJ5IGF0dGVuZGluZyBhdCBsZWFzdCAyIG1lZXRpbmdzIGVhY2ggd2VlaywgeW91IHdpbGwgY2VydGFpbmx5IGJlIGNvbnNpZGVyZWQgZm9yIHRoZSBIb3VzdG9uIHRyYXZlbCB0ZWFtLCB3aGljaCB3aWxsIGJlIGZpbmFsaXplZCBsYXRlci5cblxuSSB3aXNoIHlvdSBhbGwgdGhlIGJlc3QsIGFuZCBJIGhvcGUgdGhhdCB0aGlzIG1lc3NhZ2UgZG9lcyBub3QgZGlzc3VhZGUgeW91IGZyb20gZnVydGhlciBwdXJzdWluZyB5b3VyIHBhc3Npb24gZm9yIHJvYm90aWNzLlxuXG5GaW5uIn0";
window.travelTeamData = "4eyIyMmV0aGFuY0BzdHVkZW50cy5oYXJrZXIub3JnIjoiYSIsIjIyemFjaGNAc3R1ZGVudHMuaGFya2VyLm9yZyI6ImEiLCIyMmFyanVuZEBzdHVkZW50cy5oYXJrZXIub3JnIjoiYSIsIjIyYWxpY2VmQHN0dWRlbnRzLmhhcmtlci5vcmciOiJhIiwiMjJkZW5uaXNnQHN0dWRlbnRzLmhhcmtlci5vcmciOiJhIiwiMjJzaG91bmFrZ0BzdHVkZW50cy5oYXJrZXIub3JnIjoiYSIsIjIyYXJuYXZnQHN0dWRlbnRzLmhhcmtlci5vcmciOiJhIiwiMjJwcmFuYXZnQHN0dWRlbnRzLmhhcmtlci5vcmciOiJhIiwiMjJwcmFrcml0akBzdHVkZW50cy5oYXJrZXIub3JnIjoiYSIsIjIyYW5naWVqQHN0dWRlbnRzLmhhcmtlci5vcmciOiJhIiwiMjJjaGlyYWdrQHN0dWRlbnRzLmhhcmtlci5vcmciOiJhIiwiMjJhbmlydWRoa0BzdHVkZW50cy5oYXJrZXIub3JnIjoiYSIsIjIyc2hhaHplYmxAc3R1ZGVudHMuaGFya2VyLm9yZyI6ImEiLCIyMmFsZXhsQHN0dWRlbnRzLmhhcmtlci5vcmciOiJhIiwiMjJrYXRlb0BzdHVkZW50cy5oYXJrZXIub3JnIjoiYSIsIjIyYW5pc2hwQHN0dWRlbnRzLmhhcmtlci5vcmciOiJhIiwiMjJhaW1lZXdAc3R1ZGVudHMuaGFya2VyLm9yZyI6ImEiLCIyMmNvbm5vcndAc3R1ZGVudHMuaGFya2VyLm9yZyI6ImEiLCIyMmdsb3JpYXpAc3R1ZGVudHMuaGFya2VyLm9yZyI6ImEiLCIyMWNobG9lYUBzdHVkZW50cy5oYXJrZXIub3JnIjoiYSIsIjIxaGFyaWJAc3R1ZGVudHMuaGFya2VyLm9yZyI6ImEiLCIyMWFuZ2VsYWNAc3R1ZGVudHMuaGFya2VyLm9yZyI6ImEiLCIyMWFydGh1cmpAc3R1ZGVudHMuaGFya2VyLm9yZyI6ImEiLCIyMWFua2l0YWtAc3R1ZGVudHMuaGFya2VyLm9yZyI6ImEiLCIyMWF5ZGludEBzdHVkZW50cy5oYXJrZXIub3JnIjoiYSIsIjIxYWRpdGl2QHN0dWRlbnRzLmhhcmtlci5vcmciOiJhIiwiMjBmaW5uZkBzdHVkZW50cy5oYXJrZXIub3JnIjoiYSIsIjIwamF0aW5rQHN0dWRlbnRzLmhhcmtlci5vcmciOiJhIiwiMjBzYW5qYXlyQHN0dWRlbnRzLmhhcmtlci5vcmciOiJhIiwiMjByb2hhbnNAc3R1ZGVudHMuaGFya2VyLm9yZyI6ImEiLCIyMnJvaGFuckBzdHVkZW50cy5oYXJrZXIub3JnIjoiciJ9";
window.decode = function(x) {return JSON.parse(atob(x.substring(1)));}

function waitForWebfonts(fonts, callback) {
    var loadedFonts = 0;
    for(var i = 0, l = fonts.length; i < l; ++i) {
        (function(font) {
            var node = document.createElement('span');
            // Characters that vary significantly among different fonts
            node.innerHTML = 'giItT1WQy@!-/#';
            // Visible - so we can measure it - but not on the screen
            node.style.position      = 'absolute';
            node.style.left          = '-10000px';
            node.style.top           = '-10000px';
            // Large font size makes even subtle changes obvious
            node.style.fontSize      = '300px';
            // Reset any font properties
            node.style.fontFamily    = 'sans-serif';
            node.style.fontVariant   = 'normal';
            node.style.fontStyle     = 'normal';
            node.style.fontWeight    = 'normal';
            node.style.letterSpacing = '0';
            document.body.appendChild(node);

            // Remember width with no applied web font
            var width = node.offsetWidth;

            node.style.fontFamily = font;

            var interval;
            function checkFont() {
                // Compare current width with original width
                if(node && node.offsetWidth != width) {
                    ++loadedFonts;
                    node.parentNode.removeChild(node);
                    node = null;
                }

                // If all fonts have been loaded
                if(loadedFonts >= fonts.length) {
                    if(interval) {
                        clearInterval(interval);
                    }
                    if(loadedFonts == fonts.length) {
                        callback();
                        return true;
                    }
                }
            };

            if(!checkFont()) {
                interval = setInterval(checkFont, 50);
            }
        })(fonts[i]);
    }
};


function handleXHRError(xhr) {
  console.error(xhr)
  if (xhr && xhr.responseJSON && xhr.responseJSON.error) alert(xhr.responseJSON.error.message)
  else if (xhr && xhr.responseJSON) {
    alert('An error occured.')
    console.error(xhr.responseJSON.error)
  }
  else if (xhr && xhr.responseText) {
    alert('An error occured.')
    console.error(xhr.responseText)
  }
}
