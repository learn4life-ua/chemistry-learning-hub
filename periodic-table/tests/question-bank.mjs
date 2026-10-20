import assert from 'node:assert/strict';
import { elements, byNumber, detailsByNumber, topics, questionBank, makeRound } from '../js/learning-data.js';

assert.equal(elements.length, 118);
assert.equal(byNumber.get(28).name, 'Нікол');
assert.equal(byNumber.get(2).block, 's');
assert.equal(byNumber.get(1).category, 'nonmetal');
assert.equal(detailsByNumber.get(2).en, null);
for (const limit of [20, 54]) {
  const bank = questionBank(limit);
  assert.equal(new Set(bank.map(q => q.id)).size, bank.length);
  for (const q of bank) {
    assert.equal(new Set(q.options).size, 4, q.id);
    assert.ok(q.options.includes(q.answer), q.id);
    assert.ok(q.explanation && q.hint, q.id);
    if (q.id.startsWith('en-')) {
      const [a, b] = q.id.slice(3).split('-').map(Number);
      const x = detailsByNumber.get(a).en, y = detailsByNumber.get(b).en;
      assert.ok(Number.isFinite(x) && Number.isFinite(y) && x !== y, q.id);
      assert.equal(q.answer, byNumber.get(x > y ? a : b).symbol, q.id);
    }
    if (q.id.startsWith('radius-')) {
      const [a, b] = q.id.slice(7).split('-').map(n => byNumber.get(Number(n)));
      assert.ok(a.group === b.group || a.period === b.period, q.id);
      assert.ok(a.block !== 'd' && b.block !== 'd', q.id);
    }
  }
  for (const topic of Object.keys(topics)) {
    for (let attempt = 0; attempt < 100; attempt++) {
      const round = makeRound(topic, limit);
      assert.equal(round.length, 10);
      assert.equal(new Set(round.map(q => q.id)).size, 10);
      if (topic === 'mixed') {
        for (const key of Object.keys(topics).filter(key => key !== 'mixed')) {
          assert.equal(round.filter(q => q.topic === key).length, 2);
        }
      } else assert.ok(round.every(q => q.topic === topic));
    }
  }
  console.log(`PASS: ${bank.length} questions; ${limit}-element set; all six round modes.`);
}
