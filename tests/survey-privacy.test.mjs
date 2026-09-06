import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizePhone,privateHash} from '../lib/survey.ts';
test('normalizes only valid mainland mobile numbers for deduplication',()=>{assert.equal(normalizePhone('+86 138-0000-0000'),'13800000000');assert.equal(normalizePhone('13800000000'),'13800000000');assert.equal(normalizePhone('010-12345678'),null);assert.equal(normalizePhone('138000000001'),null);assert.equal(normalizePhone(''),null)});
test('keyed fingerprints are deterministic, private and isolated by secret',async()=>{const a=await privateHash('poll:13800000000','test-secret-a');assert.equal(a,await privateHash('poll:13800000000','test-secret-a'));assert.notEqual(a,await privateHash('poll:13800000000','test-secret-b'));assert.notEqual(a,await privateHash('poll:13900000000','test-secret-a'));assert.equal(a.length,64);assert.ok(!a.includes('13800000000'))});
