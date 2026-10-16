sceneQ.length = 0; sceneEnd();
Object.assign(S, {bank:3e9, earned:2e10, allTime:2e10, clicks:500, handmade:1e6, golden:9});
S.b = {bubbe:45, bakery:32, deli:21, school:15, klezmer:12, shul:8, kibbutz:6, yeshiva:3};
S.lvl = {deli:1, kibbutz:1, school:1};
S.pom.since = Date.now() - 600000; S.pom.n = 3;
['bubbe_t0','bubbe_t1','bakery_t0','c0','c1','f0','f1','f2'].forEach(id => upSet.add(id));
afterLoad(); storyCheck(true); checkAch(true); recalc(); renderHood(true); refreshUpgrades(true);
document.querySelectorAll('.toast').forEach(t => t.remove());
