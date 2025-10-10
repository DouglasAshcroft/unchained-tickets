CLS
+25
SI
+10
Performance
Values are estimated and may vary. The performance score is calculated directly from these metrics.See calculator.
0–49
50–89
90–100
Final Screenshot

Metrics
Expand view
First Contentful Paint
0.4 s
Largest Contentful Paint
0.5 s
Total Blocking Time
890 ms
Cumulative Layout Shift
0.002
Speed Index
0.4 s
View Treemap
Screenshot
Screenshot
Screenshot
Screenshot
Screenshot
Screenshot
Screenshot
Screenshot
Later this year, insights will replace performance audits. Learn more and provide feedback here.
Go back to audits
Show audits relevant to:

All

FCP

LCP

TBT

CLS
Insights
Network dependency tree
Avoid chaining critical requests by reducing the length of chains, reducing the download size of resources, or deferring the download of unnecessary resources to improve page load.LCP
Maximum critical path latency: 1,468 ms
Initial Navigation
http://localhost:3000 - 90 ms, 13.28 KiB
/**nextjs_original-stack-frames(localhost) - 1,468 ms, 1.57 KiB
/**nextjs_original-stack-frames(localhost) - 1,465 ms, 1.55 KiB
Preconnected origins
preconnect hints help the browser establish a connection earlier in the page load, saving time when the first request for that origin is made. The following are the origins that the page preconnected to.
Origin
Source
https://fonts.googleapis.com/
head > link

<link rel="preconnect" href="https://fonts.googleapis.com">
Unused preconnect. Only use `preconnect` for origins that the page is likely to request.
https://fonts.gstatic.com/
head > link
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
Unused preconnect. Only use `preconnect` for origins that the page is likely to request.
Preconnect candidates
Add preconnect hints to your most important origins, but try to use no more than 4.
No additional origins are good candidates for preconnecting
Layout shift culprits
Layout shifts occur when elements move absent any user interaction. Investigate the causes of layout shifts, such as elements being added, removed, or their fonts changing as the page loads.CLS
Element
Layout shift score
Total
0.002
JOIN THE RESISTANCE
<h1 class="brand-heading text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-re…">
0.002
/fonts/special-elite.woff2(localhost)
Web font
Element
Layout shift score
Total
0.002
🌙 Dark Connect Wallet Connect Wallet Connect wallet
<div class="flex items-center space-x-2 sm:space-x-3">
0.002
LCP breakdown
Each subpart has specific improvement strategies. Ideally, most of the LCP time should be spent on loading the resources, not within delays.LCP
Subpart
Duration
Time to first byte
50 ms
Element render delay
160 ms
Experience live music like never before. Buy tickets as NFTs, own your memories…
<p class="text-xl md:text-2xl mb-8 text-grit-300 max-w-3xl mx-auto">
These insights are also available in the Chrome DevTools Performance Panel - record a trace to view more detailed information.
Diagnostics
Page prevented back/forward cache restoration 5 failure reasons
Many navigations are performed by going back to a previous page, or forwards again. The back/forward cache (bfcache) can speed up these return navigations. Learn more about the bfcache
Failure reason
Failure type
Pages with cache-control:no-store header cannot enter back/forward cache.
Actionable
http://localhost:3000
Pages with WebSocket cannot enter back/forward cache.
Pending browser support
http://localhost:3000
Pages whose main resource has cache-control:no-store cannot enter back/forward cache.
Not actionable
http://localhost:3000
Back/forward cache is disabled because some JavaScript network request received resource with `Cache-Control: no-store` header.
Not actionable
http://localhost:3000
WebSocketUsedWithCCNS
Not actionable
http://localhost:3000
Minify CSS Est savings of 11 KiB
Minifying CSS files can reduce network payload sizes. Learn how to minify CSS.FCPLCP
URL
Transfer Size
Est Savings
Unattributable
9.9 KiB	7.2 KiB
:host(.dark) { --color-font: white; --color-backdrop: rgba(0, 0, 0, 0.8); --color-border-shad…
3.7 KiB
2.7 KiB
:host { /* * Although the style applied to the shadow host is isolated, * the element that a…
3.2 KiB
2.3 KiB
:host { all: initial; /* the direction property is not reset by 'all' */ direction: ltr; } …
3.0 KiB
2.2 KiB
localhost 1st party
20.4 KiB	3.9 KiB
…app/layout.css?v=176…(localhost)
20.4 KiB
3.9 KiB
Minify JavaScript Est savings of 22 KiB
Minifying JavaScript files can reduce payload sizes and script parse time. Learn how to minify JavaScript.FCPLCP
URL
Transfer Size
Est Savings
localhost 1st party
27.6 KiB	22.0 KiB
…chunks/webpack.js?v=176…(localhost)
27.6 KiB
22.0 KiB
Avoid serving legacy JavaScript to modern browsers Est savings of 23 KiB
Polyfills and transforms enable legacy browsers to use new JavaScript features. However, many aren't necessary for modern browsers. Consider modifying your JavaScript build process to not transpile Baseline features, unless you know you must support legacy browsers. Learn why most sites can deploy ES6+ code without transpilingFCPLCP
URL
Est Savings
localhost 1st party
22.6 KiB
…chunks/main-app.js?v=176…(localhost)
10.4 KiB
…chunks/main-app.js?v=176…:1160:116330(localhost)
@babel/plugin-transform-classes
…chunks/main-app.js?v=176…:1160:561042(localhost)
@babel/plugin-transform-spread
…chunks/main-app.js?v=176…:72:1029(localhost)
Array.prototype.at
…chunks/main-app.js?v=176…:72:415(localhost)
Array.prototype.flat
…chunks/main-app.js?v=176…:72:528(localhost)
Array.prototype.flatMap
…chunks/main-app.js?v=176…:72:906(localhost)
Object.fromEntries
…chunks/main-app.js?v=176…:72:1164(localhost)
Object.hasOwn
…chunks/main-app.js?v=176…:72:151(localhost)
String.prototype.trimEnd
…chunks/main-app.js?v=176…:72:64(localhost)
String.prototype.trimStart
…app/page.js(localhost)
6.3 KiB
…app/page.js:4026:101712(localhost)
Object.create
…app/layout.js(localhost)
5.9 KiB
…app/layout.js:711:101712(localhost)
Object.create
Reduce unused JavaScript Est savings of 1,707 KiB
Reduce unused JavaScript and defer loading scripts until they are required to decrease bytes consumed by network activity. Learn how to reduce unused JavaScript.FCPLCP
URL
Transfer Size
Est Savings
localhost 1st party
3,489.9 KiB	1,706.9 KiB
…app/page.js(localhost)
3,489.9 KiB
1,706.9 KiB
Avoid enormous network payloads Total size was 8,017 KiB
Large network payloads cost users real money and are highly correlated with long load times. Learn how to reduce payload sizes.
URL
Transfer Size
localhost 1st party
7,930.9 KiB
…app/page.js(localhost)
3,490.4 KiB
…app/layout.js(localhost)
1,897.2 KiB
…chunks/main-app.js?v=176…(localhost)
1,713.9 KiB
…chunks/_app-pages-browser_node_modules_base-org_account_dis….js(localhost)
583.0 KiB
…chunks/app-pages-internals.js(localhost)
61.0 KiB
/fonts/special-elite.woff2(localhost)
53.1 KiB
…media/e4af272ccee01ff0-s.p.woff2(localhost)
47.6 KiB
…chunks/_app-pages-browser_node_modules_react-hot-toast_dist….js(localhost)
28.7 KiB
/__nextjs_font/geist-latin.woff2(localhost)
28.0 KiB
…chunks/webpack.js?v=176…(localhost)
28.0 KiB
Avoid long main-thread tasks 4 long tasks found
Lists the longest tasks on the main thread, useful for identifying worst contributors to input delay. Learn how to avoid long main-thread tasksTBT
URL
Start Time
Duration
localhost 1st party
1,092 ms
…app/page.js(localhost)
7,195 ms
384 ms
…app/layout.js(localhost)
5,487 ms
321 ms
…chunks/main-app.js?v=176…(localhost)
4,915 ms
287 ms
…chunks/_app-pages-browser_node_modules_base-org_account_dis….js(localhost)
6,167 ms
100 ms
User Timing marks and measures 3 user timings
Consider instrumenting your app with the User Timing API to measure your app's real-world performance during key user experiences. Learn more about User Timing marks.
Name
Type
Start Time
Duration
ua_parser
Measure
1,635.51 ms
3.21 ms
ua_parser_start
Mark
1,635.51 ms
ua_parser_end
Mark
1,638.73 ms
More information about the performance of your application. These numbers don't directly affect the Performance score.
Passed audits (22)
Show
93
Accessibility
These checks highlight opportunities to improve the accessibility of your web app. Automatic detection can only detect a subset of issues and does not guarantee the accessibility of your web app, so manual testing is also encouraged.
Contrast
Background and foreground colors do not have a sufficient contrast ratio.
These are opportunities to improve the legibility of your content.
Navigation
Heading elements are not in a sequentially-descending order
These are opportunities to improve keyboard navigation in your application.
Additional items to manually check (10)
Show
These items address areas which an automated testing tool cannot cover. Learn more in our guide on conducting an accessibility review.
Passed audits (18)
Show
Not applicable (37)
Show
96
Best Practices
General
Browser errors were logged to the console
Missing source maps for large first-party JavaScript
Trust and Safety
Ensure CSP is effective against XSS attacks
Mitigate DOM-based XSS with Trusted Types
Passed audits (12)
Show
Not applicable (6)
Show
82
SEO
These checks ensure that your page is following basic search engine optimization advice. There are many additional factors Lighthouse does not score here that may affect your search ranking, including performance on Core Web Vitals. Learn more about Google Search Essentials.
Content Best Practices
Links do not have descriptive text 1 link found
Descriptive link text helps search engines understand your content. Learn how to make links more accessible.
Link destination
Link Text
localhost 1st party
/about(localhost)
Learn More
Format your HTML in a way that enables crawlers to better understand your app’s content.
Crawling and Indexing
robots.txt is not validLighthouse was unable to download a robots.txt file
If your robots.txt file is malformed, crawlers may not be able to understand how you want your website to be crawled or indexed. Learn more about robots.txt.
To appear in search results, crawlers need access to your app.
Additional items to manually check (1)
Show
Run these additional validators on your site to check additional SEO best practices.

42
Performance
96
Accessibility
96
Best Practices
92
SEO
There were issues affecting this run of Lighthouse:

There may be stored data affecting loading performance in this location: IndexedDB. Audit this page in an incognito window to prevent those resources from affecting your scores.
42
FCP
+10
LCP
+0
TBT
+2
CLS
+22
SI
+9
Performance
Values are estimated and may vary. The performance score is calculated directly from these metrics.See calculator.
0–49
50–89
90–100
Final Screenshot

Metrics
Expand view
First Contentful Paint
0.4 s
Largest Contentful Paint
12.7 s
Total Blocking Time
1,020 ms
Cumulative Layout Shift
0.108
Speed Index
1.3 s
View Treemap
Screenshot
Screenshot
Screenshot
Screenshot
Screenshot
Screenshot
Screenshot
Screenshot
Later this year, insights will replace performance audits. Learn more and provide feedback here.
Go back to audits
Show audits relevant to:

All

FCP

LCP

TBT

CLS
Insights
Improve image delivery Est savings of 85 KiB
Reducing the download time of images can improve the perceived load time of the page and LCP. Learn more about optimizing image sizeFCPLCP
URL
Resource Size
Est Savings
localhost 1st party
115.7 KiB 84.7 KiB
/\_next/image?url=…(localhost)
67.3 KiB
54.3 KiB
Increasing the image compression factor could improve this image's download size.
17.3 KiB
This image file is larger than it needs to be (640x480) for its displayed dimensions (327x245). Use responsive images to reduce the image download size.
49.8 KiB
/\_next/image?url=…(localhost)
24.9 KiB
15.7 KiB
This image file is larger than it needs to be (570x427) for its displayed dimensions (368x245). Use responsive images to reduce the image download size.
15.7 KiB
/\_next/image?url=…(localhost)
23.4 KiB
14.8 KiB
This image file is larger than it needs to be (570x427) for its displayed dimensions (368x245). Use responsive images to reduce the image download size.
14.8 KiB
Legacy JavaScript Est savings of 29 KiB
Polyfills and transforms enable older browsers to use new JavaScript features. However, many aren't necessary for modern browsers. Consider modifying your JavaScript build process to not transpile Baseline features, unless you know you must support older browsers. Learn why most sites can deploy ES6+ code without transpilingFCPLCP
URL
Wasted bytes
localhost 1st party
28.9 KiB
…chunks/main-app.js?v=176…(localhost)
10.4 KiB
…chunks/main-app.js?v=176…:1160:116330(localhost)
@babel/plugin-transform-classes
…chunks/main-app.js?v=176…:1160:561042(localhost)
@babel/plugin-transform-spread
…chunks/main-app.js?v=176…:72:1029(localhost)
Array.prototype.at
…chunks/main-app.js?v=176…:72:415(localhost)
Array.prototype.flat
…chunks/main-app.js?v=176…:72:528(localhost)
Array.prototype.flatMap
…chunks/main-app.js?v=176…:72:906(localhost)
Object.fromEntries
…chunks/main-app.js?v=176…:72:1164(localhost)
Object.hasOwn
…chunks/main-app.js?v=176…:72:151(localhost)
String.prototype.trimEnd
…chunks/main-app.js?v=176…:72:64(localhost)
String.prototype.trimStart
…events/page.js(localhost)
6.3 KiB
…events/page.js:4070:101712(localhost)
Object.create
…app/page.js(localhost)
6.3 KiB
…app/page.js:4026:101712(localhost)
Object.create
…app/layout.js(localhost)
5.9 KiB
…app/layout.js:711:101712(localhost)
Object.create
Layout shift culprits
Layout shifts occur when elements move absent any user interaction. Investigate the causes of layout shifts, such as elements being added, removed, or their fonts changing as the page loads.CLS
Element
Layout shift score
Total
0.000
UPCOMING EVENTS

<h1 class="brand-heading text-4xl font-bold bg-gradient-to-r from-resistance-500 via-…">
0.000
/fonts/special-elite.woff2(localhost)
Web font
Element
Layout shift score
Total
0.108
Events Artists Venues About © 2025 Unchained. Powered by Base.
<footer class="border-t border-white/10 bg-[var(--background)] mt-auto">
0.106
🌙 Dark Connect Wallet Connect Wallet Connect wallet
<div class="flex items-center space-x-2 sm:space-x-3">
0.002
LCP request discovery
Optimize LCP by making the LCP image discoverable from the HTML immediately, and avoiding lazy-loadingLCP
fetchpriority=high should be applied
Request is discoverable in initial document
lazy load not applied
Midnight Dreams Tour - Getter
<img alt="Midnight Dreams Tour - Getter" loading="lazy" decoding="async" data-nimg="fill" class="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" srcset="/_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1514525253161-7…" src="http://localhost:3000/_next/image?url=https%3A%2F%2Fimages.unsplash.com%2F…" style="position: absolute; height: 100%; width: 100%; inset: 0px;">
Network dependency tree
Avoid chaining critical requests by reducing the length of chains, reducing the download size of resources, or deferring the download of unnecessary resources to improve page load.LCP
Maximum critical path latency: 2,309 ms
Initial Navigation
/events(localhost) - 366 ms, 11.30 KiB
/__nextjs_original-stack-frames(localhost) - 2,309 ms, 1.76 KiB
/__nextjs_original-stack-frames(localhost) - 2,277 ms, 1.73 KiB
Preconnected origins
preconnect hints help the browser establish a connection earlier in the page load, saving time when the first request for that origin is made. The following are the origins that the page preconnected to.
Origin
Source
https://fonts.googleapis.com/
head > link
<link rel="preconnect" href="https://fonts.googleapis.com">
Unused preconnect. Only use `preconnect` for origins that the page is likely to request.
https://fonts.gstatic.com/
head > link
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
Unused preconnect. Only use `preconnect` for origins that the page is likely to request.
Preconnect candidates
Add preconnect hints to your most important origins, but try to use no more than 4.
No additional origins are good candidates for preconnecting
LCP breakdown
Each subpart has specific improvement strategies. Ideally, most of the LCP time should be spent on loading the resources, not within delays.LCP
Subpart
Duration
Time to first byte
350 ms
Resource load delay
2,170 ms
Resource load duration
20 ms
Element render delay
160 ms
Midnight Dreams Tour - Getter
<img alt="Midnight Dreams Tour - Getter" loading="lazy" decoding="async" data-nimg="fill" class="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" srcset="/_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1514525253161-7…" src="http://localhost:3000/_next/image?url=https%3A%2F%2Fimages.unsplash.com%2F…" style="position: absolute; height: 100%; width: 100%; inset: 0px;">
These insights are also available in the Chrome DevTools Performance Panel - record a trace to view more detailed information.
Diagnostics
Reduce JavaScript execution time 1.6 s
Consider reducing the time spent parsing, compiling, and executing JS. You may find delivering smaller JS payloads helps with this. Learn how to reduce Javascript execution time.TBT
URL
Total CPU Time
Script Evaluation
Script Parse
localhost 1st party
1,478 ms	702 ms	610 ms
…events/page.js(localhost)
414 ms
199 ms
195 ms
…chunks/main-app.js?v=176…(localhost)
329 ms
228 ms
97 ms
…app/layout.js(localhost)
328 ms
196 ms
109 ms
…app/page.js(localhost)
176 ms
1 ms
175 ms
/events(localhost)
131 ms
19 ms
2 ms
…chunks/_app-pages-browser_node_modules_base-org_account_dis….js(localhost)
99 ms
60 ms
32 ms
Unattributable
380 ms	238 ms	0 ms
webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js
145 ms
142 ms
0 ms
Unattributable
101 ms
5 ms
0 ms
webpack-internal:///(app-pages-browser)/./node_modules/@tanstack/query-core/build/modern/notifyManager.js
73 ms
32 ms
0 ms
webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/scheduler/cjs/scheduler.development.js
61 ms
60 ms
0 ms
Reduce unused JavaScript Est savings of 5,137 KiB
Reduce unused JavaScript and defer loading scripts until they are required to decrease bytes consumed by network activity. Learn how to reduce unused JavaScript.FCPLCP
URL
Transfer Size
Est Savings
localhost 1st party
7,110.4 KiB	5,136.7 KiB
…app/page.js(localhost)
3,489.9 KiB
3,420.0 KiB
…events/page.js(localhost)
3,620.5 KiB
1,716.7 KiB
Avoid serving legacy JavaScript to modern browsers Est savings of 29 KiB
Polyfills and transforms enable legacy browsers to use new JavaScript features. However, many aren't necessary for modern browsers. Consider modifying your JavaScript build process to not transpile Baseline features, unless you know you must support legacy browsers. Learn why most sites can deploy ES6+ code without transpilingFCPLCP
URL
Est Savings
localhost 1st party
28.9 KiB
…chunks/main-app.js?v=176…(localhost)
10.4 KiB
…chunks/main-app.js?v=176…:1160:116330(localhost)
@babel/plugin-transform-classes
…chunks/main-app.js?v=176…:1160:561042(localhost)
@babel/plugin-transform-spread
…chunks/main-app.js?v=176…:72:1029(localhost)
Array.prototype.at
…chunks/main-app.js?v=176…:72:415(localhost)
Array.prototype.flat
…chunks/main-app.js?v=176…:72:528(localhost)
Array.prototype.flatMap
…chunks/main-app.js?v=176…:72:906(localhost)
Object.fromEntries
…chunks/main-app.js?v=176…:72:1164(localhost)
Object.hasOwn
…chunks/main-app.js?v=176…:72:151(localhost)
String.prototype.trimEnd
…chunks/main-app.js?v=176…:72:64(localhost)
String.prototype.trimStart
…events/page.js(localhost)
6.3 KiB
…events/page.js:4070:101712(localhost)
Object.create
…app/page.js(localhost)
6.3 KiB
…app/page.js:4026:101712(localhost)
Object.create
…app/layout.js(localhost)
5.9 KiB
…app/layout.js:711:101712(localhost)
Object.create
Page prevented back/forward cache restoration 5 failure reasons
Many navigations are performed by going back to a previous page, or forwards again. The back/forward cache (bfcache) can speed up these return navigations. Learn more about the bfcache
Failure reason
Failure type
Pages with cache-control:no-store header cannot enter back/forward cache.
Actionable
/events(localhost)
Pages with WebSocket cannot enter back/forward cache.
Pending browser support
/events(localhost)
Pages whose main resource has cache-control:no-store cannot enter back/forward cache.
Not actionable
/events(localhost)
Back/forward cache is disabled because some JavaScript network request received resource with `Cache-Control: no-store` header.
Not actionable
/events(localhost)
WebSocketUsedWithCCNS
Not actionable
/events(localhost)
Minify CSS Est savings of 11 KiB
Minifying CSS files can reduce network payload sizes. Learn how to minify CSS.FCPLCP
URL
Transfer Size
Est Savings
Unattributable
9.9 KiB	7.2 KiB
:host(.dark) { --color-font: white; --color-backdrop: rgba(0, 0, 0, 0.8); --color-border-shad…
3.7 KiB
2.7 KiB
:host { /* * Although the style applied to the shadow host is isolated, * the element that a…
3.2 KiB
2.3 KiB
:host { all: initial; /* the direction property is not reset by 'all' */ direction: ltr; } …
3.0 KiB
2.2 KiB
localhost 1st party
20.4 KiB	3.9 KiB
…app/layout.css?v=176…(localhost)
20.4 KiB
3.9 KiB
Minify JavaScript Est savings of 22 KiB
Minifying JavaScript files can reduce payload sizes and script parse time. Learn how to minify JavaScript.FCPLCP
URL
Transfer Size
Est Savings
localhost 1st party
27.6 KiB	22.0 KiB
…chunks/webpack.js?v=176…(localhost)
27.6 KiB
22.0 KiB
Avoid enormous network payloads Total size was 14,090 KiB
Large network payloads cost users real money and are highly correlated with long load times. Learn how to reduce payload sizes.
URL
Transfer Size
localhost 1st party
13,794.9 KiB
…events/page.js(localhost)
3,621.0 KiB
…app/page.js(localhost)
3,490.4 KiB
/api/events(localhost)
2,259.8 KiB
…app/layout.js(localhost)
1,897.2 KiB
…chunks/main-app.js?v=176…(localhost)
1,713.9 KiB
…chunks/_app-pages-browser_node_modules_base-org_account_dis….js(localhost)
583.0 KiB
/_next/image?url=…(localhost)
67.8 KiB
…chunks/app-pages-internals.js(localhost)
61.0 KiB
/fonts/special-elite.woff2(localhost)
53.1 KiB
…media/e4af272ccee01ff0-s.p.woff2(localhost)
47.6 KiB
Avoid long main-thread tasks 6 long tasks found
Lists the longest tasks on the main thread, useful for identifying worst contributors to input delay. Learn how to avoid long main-thread tasksTBT
URL
Start Time
Duration
localhost 1st party
1,347 ms
…events/page.js(localhost)
12,411 ms
414 ms
…chunks/main-app.js?v=176…(localhost)
6,783 ms
329 ms
…app/layout.js(localhost)
7,715 ms
329 ms
…app/page.js(localhost)
12,235 ms
176 ms
…chunks/_app-pages-browser_node_modules_base-org_account_dis….js(localhost)
9,047 ms
99 ms
Unattributable
182 ms
webpack-internal:///(app-pages-browser)/./node_modules/@tanstack/query-core/build/modern/notifyManager.js
201 ms
182 ms
User Timing marks and measures 3 user timings
Consider instrumenting your app with the User Timing API to measure your app's real-world performance during key user experiences. Learn more about User Timing marks.
Name
Type
Start Time
Duration
ua_parser
Measure
2,652.27 ms
1.95 ms
ua_parser_start
Mark
2,652.27 ms
ua_parser_end
Mark
2,654.22 ms
More information about the performance of your application. These numbers don't directly affect the Performance score.
