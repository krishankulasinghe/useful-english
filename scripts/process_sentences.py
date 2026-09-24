#!/usr/bin/env python3
"""
Process, clean, deduplicate English-Sinhala sentences from RTF,
export to SQLite, JSON, and CSV, and update assets/content/content.json.
"""

import os
import sys
import re
import json
import csv
import sqlite3
import subprocess
import unicodedata
from collections import defaultdict

WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RTF_PATH = os.path.join(WORKSPACE_ROOT, 'data', 'English sentences .rtf')
DB_PATH = os.path.join(WORKSPACE_ROOT, 'data', 'lexi_sentences.db')
JSON_PATH = os.path.join(WORKSPACE_ROOT, 'data', 'sentences_cleaned.json')
CSV_PATH = os.path.join(WORKSPACE_ROOT, 'data', 'sentences_cleaned.csv')
CONTENT_JSON_PATH = os.path.join(WORKSPACE_ROOT, 'assets', 'content', 'content.json')

def get_text_from_rtf(path):
    cmd = ['textutil', '-convert', 'txt', '-stdout', path]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    return res.stdout.decode('utf-8')

def normalize_key(s):
    return re.sub(r'[^\w\s]', '', s.lower()).strip()

def normalize_search_text(*parts):
    joined = ' '.join(p for p in parts if p)
    nfc = unicodedata.normalize('NFC', joined)
    # Strip zero-width joiners / non-joiners
    cleaned = re.sub(r'[\u200C\u200D]', '', nfc)
    return cleaned.lower().strip()

def clean_en(text):
    t = text.strip()
    t = re.sub(r'^[0-9]+[\.\)]\s*', '', t)
    t = re.sub(r'^\.\s*', '', t)
    # normalize quotes / apostrophes
    t = t.replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')
    return t.strip()

def clean_si(text):
    t = text.strip()
    t = re.sub(r'^[0-9]+[\.\)]\s*', '', t)
    t = re.sub(r'^\.\s*', '', t)
    t = t.strip(' —-–')
    return t.strip()

def assign_level(en):
    words = en.split()
    word_count = len(words)
    if word_count <= 5:
        return 'beginner'
    elif word_count <= 10:
        return 'intermediate'
    else:
        return 'advanced'

def classify_category(en, sec_idx, subcat_label):
    en_lower = en.lower()

    # Section 14 subcategory tags
    if subcat_label:
        if any(w in subcat_label for w in ['උදේ', 'නිදාගන්න', 'ගෙදර']):
            return 's-home'
        if any(w in subcat_label for w in ['වැඩ', 'පාඩම්']):
            return 's-work-office'
        if 'කෑම' in subcat_label:
            return 's-restaurants-food'
        if 'පිටත්' in subcat_label:
            return 's-transportation'
        if any(w in subcat_label for w in ['හවස', 'රාත්‍රී', 'මැද']):
            return 's-everyday-conversations'

    # Emergencies & Problems
    if re.search(r'\b(emergency|police|ambulance|fire|danger|stolen|robbed|lost my (wallet|passport|phone)|help me please)\b', en_lower):
        return 's-emergencies'
    if re.search(r'\b(problem|issue|broken|doesn\'t work|not working|damaged|wrong|mistake|complain|complaint|terrible|awful|delay)\b', en_lower):
        return 's-problems-complaints'

    # Airport & Travel
    if re.search(r'\b(airport|flight|terminal|gate|boarding|passport|luggage|baggage|customs|immigration|delayed|on time)\b', en_lower):
        return 's-airport'
    if re.search(r'\b(hotel|reservation|booking|check-in|check-out|room key|reception|lobby|suite|front desk)\b', en_lower):
        return 's-hotel'
    if re.search(r'\b(train|bus|subway|metro|station|stop|ticket|taxi|cab|fare|route|platform|commute|traffic)\b', en_lower):
        return 's-transportation'
    if re.search(r'\b(where is|how (do|can) i get to|turn (left|right)|straight ahead|cross the road|directions?|nearby|which way)\b', en_lower):
        return 's-giving-directions'
    if re.search(r'\b(travel|trip|visit|sightseeing|tourist|vacation|holiday|destination)\b', en_lower):
        return 's-travel'

    # Work, Meetings, Interviews & Business
    if re.search(r'\b(interview|job|resume|cv|hired|apply for|career|position|experience|salary)\b', en_lower):
        return 's-job-interviews'
    if re.search(r'\b(meeting|agenda|minutes|reschedule|conference|presentation|discuss|discussing)\b', en_lower):
        return 's-meetings'
    if re.search(r'\b(business|contract|deal|partner|client|company|industry|market|negotiate)\b', en_lower):
        return 's-business'
    if re.search(r'\b(computer|software|app|internet|wifi|password|email|tech|device|screen|code|server|online|download)\b', en_lower):
        return 's-technology'
    if re.search(r'\b(office|colleague|boss|coworker|manager|deadline|project|task|report|duty|work)\b', en_lower):
        return 's-work-office'
    if re.search(r'\b(school|university|class|course|exam|test|study|homework|teacher|professor|learn|lesson)\b', en_lower):
        return 's-school-education'

    # Health & Money
    if re.search(r'\b(doctor|hospital|medicine|headache|fever|pain|sick|ill|clinic|pill|prescription|cough|cold|dentist|appointment|hurt|hurts)\b', en_lower):
        return 's-doctor-health'
    if re.search(r'\b(bank|atm|cash|card|credit card|pay|bill|receipt|dollars|rupees|money|cost|price|expensive|cheap|fee|change)\b', en_lower):
        return 's-banking-money'

    # Food & Shopping
    if re.search(r'\b(restaurant|menu|breakfast|lunch|dinner|eat|food|coffee|tea|order|delicious|taste|drink|waiter|bill please)\b', en_lower):
        return 's-restaurants-food'
    if re.search(r'\b(shop|shopping|supermarket|store|buy|bought|mall|discount|sale|price tag|size|fit)\b', en_lower):
        return 's-shopping'

    # Home, Family & Friends
    if re.search(r'\b(friend|friends|family|mother|father|parents|mom|dad|brother|sister|son|daughter|kids|children|husband|wife)\b', en_lower):
        return 's-family-friends'
    if re.search(r'\b(house|home|room|kitchen|bedroom|door|window|clean|wash|sleep|bed|woke up)\b', en_lower):
        return 's-home'
    if re.search(r'\b(invite|invitation|party|join us|come over|celebrate|dinner with us)\b', en_lower):
        return 's-invitations'
    if re.search(r'\b(plan|plans|planning|tomorrow|next week|weekend|schedule|let\'s meet|shall we)\b', en_lower):
        return 's-making-plans'

    # Social & Polite Conversations
    if re.search(r'\b(phone|call me|ring|dial|voicemail|text|message|whatsapp)\b', en_lower):
        return 's-phone-conversations'
    if re.search(r'\b(thank|thanks|grateful|appreciate)\b', en_lower):
        return 's-thanking'
    if re.search(r'\b(sorry|apologize|apologies|my fault|my mistake|pardon me|excuse me)\b', en_lower):
        return 's-apologizing'
    if re.search(r'\b(hello|hi|good morning|good afternoon|good evening|how do you do|nice to meet you|pleased to meet you)\b', en_lower):
        return 's-greetings-introductions'
    if re.search(r'\b(help|assist|favor|give me a hand)\b', en_lower) and '?' in en_lower:
        return 's-asking-for-help'
    if re.search(r'\b(please|could you|would you mind|can you|would you)\b', en_lower):
        return 's-making-requests'
    if re.search(r'\b(agree|disagree|exactly|absolutely|i think so|i don\'t think so|you\'re right|wrong)\b', en_lower):
        return 's-agreeing-disagreeing'
    if re.search(r'\b(in my opinion|i believe|i think that|from my point of view|perspective|seems to me)\b', en_lower):
        return 's-giving-opinions'
    if re.search(r'\b(feel|feeling|happy|sad|angry|worried|nervous|tired|exhausted|scared|upset|delighted|glad|mood)\b', en_lower):
        return 's-feelings-emotions'

    # Idioms & Phrasal Verbs
    if any(p in en_lower for p in ['off guard', 'slipped my mind', 'call it a day', 'on top of', 'figure out', 'get along', 'hang out', 'look forward to', 'give up', 'take it easy', 'wrap for today']):
        return 's-phrasal-verbs'

    # Questions
    if en.strip().endswith('?') and any(en_lower.startswith(w) for w in ['what', 'why', 'how', 'when', 'where', 'who', 'is', 'are', 'do', 'does', 'did', 'can', 'could', 'would', 'will', 'have', 'has']):
        return 's-asking-questions'

    # Fallback to section core themes if available
    sec_fallbacks = {
        1: 's-common-expressions',
        2: 's-common-expressions',
        3: 's-social-situations',
        4: 's-giving-opinions',
        5: 's-home',
        6: 's-common-expressions',
        7: 's-everyday-conversations',
        8: 's-travel',
        9: 's-common-expressions',
        10: 's-common-expressions',
        11: 's-agreeing-disagreeing',
        12: 's-giving-opinions',
        13: 's-feelings-emotions',
        14: 's-everyday-conversations',
        15: 's-everyday-conversations',
        16: 's-giving-directions',
        17: 's-giving-directions'
    }
    return sec_fallbacks.get(sec_idx, 's-everyday-conversations')

def slugify(text):
    s = re.sub(r'[^a-zA-Z0-9\s-]', '', text.lower())
    s = re.sub(r'[\s_]+', '-', s).strip('-')
    parts = s.split('-')[:6]
    return '-'.join(parts) or 'sentence'

def main():
    final_sentences = []

    if os.path.exists(RTF_PATH):
        print('Reading and converting RTF...')
        raw_text = get_text_from_rtf(RTF_PATH)
        lines = [l.strip() for l in raw_text.splitlines() if l.strip()]
        print(f'Total non-empty lines: {len(lines)}')

        section_starts = [0, 800, 1400, 1900, 2500, 3400, 3702, 6302, 6728, 6928, 7128, 7328, 7828, 8528, 8839, 9239, 9739]

        parsed_items = []

        for sec_idx, start_idx in enumerate(section_starts, 1):
            end_idx = section_starts[sec_idx] if sec_idx < len(section_starts) else len(lines)
            sec_lines = lines[start_idx:end_idx]
            subcat = ''

            i = 0
            while i < len(sec_lines):
                l = sec_lines[i]

                # Detect subcategory headers (such as in Sec 14)
                if not re.match(r'^\d+[\.\)]', l) and not ('—' in l) and not l.startswith('('):
                    if any(ord(c) >= 0x0D80 and ord(c) <= 0x0DFF for c in l):
                        subcat = l
                        i += 1
                        continue

                # Format A: em-dash inline
                if '—' in l:
                    parts = [p.strip() for p in l.split('—')]
                    if len(parts) >= 3:
                        en = clean_en(parts[0])
                        pron = clean_si(parts[1])
                        meaning = clean_si(' — '.join(parts[2:]))
                        if en and pron and meaning:
                            parsed_items.append({
                                'en': en,
                                'pron': pron,
                                'meaning': meaning,
                                'sec': sec_idx,
                                'subcat': subcat
                            })
                        i += 1
                        continue

                # Format B: 3-line format
                m = re.match(r'^(\d+[\.\)]|\.)\s*(.*)', l)
                if m and any(c.isascii() and c.isalpha() for c in l):
                    en = clean_en(m.group(2))
                    if i + 2 < len(sec_lines):
                        pron = clean_si(sec_lines[i+1])
                        meaning = clean_si(sec_lines[i+2])
                        # Check for parenthetical note on next line
                        if i + 3 < len(sec_lines) and sec_lines[i+3].startswith('(') and sec_lines[i+3].endswith(')'):
                            meaning += ' ' + sec_lines[i+3].strip()
                            i += 4
                        else:
                            i += 3
                        if en and pron and meaning:
                            parsed_items.append({
                                'en': en,
                                'pron': pron,
                                'meaning': meaning,
                                'sec': sec_idx,
                                'subcat': subcat
                            })
                        continue

                i += 1

        print(f'Total items parsed: {len(parsed_items)}')

        # Deduplicate items
        seen = {}
        unique_items = []
        duplicate_count = 0

        for item in parsed_items:
            key = normalize_key(item['en'])
            if key in seen:
                duplicate_count += 1
                existing = seen[key]
                if len(item['meaning']) > len(existing['meaning']):
                    existing['meaning'] = item['meaning']
                if len(item['pron']) > len(existing['pron']):
                    existing['pron'] = item['pron']
            else:
                seen[key] = item
                unique_items.append(item)

        print(f'Duplicate items discarded: {duplicate_count}')
        print(f'Unique items retained: {len(unique_items)}')

        slug_counts = defaultdict(int)
        for item in unique_items:
            en = item['en']
            pron = item['pron']
            meaning = item['meaning']
            category_id = classify_category(en, item['sec'], item['subcat'])
            level = assign_level(en)
            search_txt = normalize_search_text(en, pron, meaning)

            base_slug = slugify(en)
            slug_counts[base_slug] += 1
            sent_id = base_slug if slug_counts[base_slug] == 1 else f'{base_slug}-{slug_counts[base_slug]}'

            final_sentences.append({
                'id': sent_id,
                'categoryId': category_id,
                'en': en,
                'pronunciationSi': pron,
                'meaningSi': meaning,
                'level': level,
                'searchText': search_txt
            })
    elif os.path.exists(JSON_PATH):
        print(f'RTF not found. Loading from existing {JSON_PATH}...')
        with open(JSON_PATH, 'r', encoding='utf-8') as f:
            raw_json = json.load(f)
        for s in raw_json:
            s['categoryId'] = classify_category(s['en'], 0, '')
            s['searchText'] = normalize_search_text(s['en'], s['pronunciationSi'], s['meaningSi'])
            final_sentences.append(s)
        print(f'Loaded and reclassified {len(final_sentences)} sentences from JSON.')
    else:
        print('Error: Neither RTF file nor cleaned JSON file found.')
        sys.exit(1)

    # Summary by category
    by_category = defaultdict(int)
    by_level = defaultdict(int)
    for s in final_sentences:
        by_category[s['categoryId']] += 1
        by_level[s['level']] += 1

    print('\nSentence count by level:')
    for lvl, count in sorted(by_level.items()):
        print(f'  {lvl}: {count}')

    print(f'\nSentence count across {len(by_category)} categories:')
    for cat, count in sorted(by_category.items(), key=lambda x: -x[1])[:10]:
        print(f'  {cat}: {count}')

    # 1. Export to SQLite
    print(f'\nExporting to SQLite: {DB_PATH}')
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE sentences (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        en TEXT NOT NULL,
        pron_si TEXT NOT NULL,
        meaning_si TEXT NOT NULL,
        level TEXT NOT NULL,
        audio_url TEXT,
        search_text TEXT NOT NULL
    );
    ''')
    cursor.execute('CREATE INDEX idx_sentences_category_id ON sentences(category_id);')
    cursor.execute('CREATE INDEX idx_sentences_level ON sentences(level);')

    rows_to_insert = [
        (s['id'], s['categoryId'], s['en'], s['pronunciationSi'], s['meaningSi'], s['level'], None, s['searchText'])
        for s in final_sentences
    ]
    cursor.executemany(
        'INSERT INTO sentences (id, category_id, en, pron_si, meaning_si, level, audio_url, search_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        rows_to_insert
    )
    conn.commit()
    conn.close()
    print(f'SQLite export complete. Total rows: {len(rows_to_insert)}')

    # 2. Export to JSON
    print(f'Exporting to JSON: {JSON_PATH}')
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        # Exclude internal searchText from clean public JSON
        clean_json_list = [
            {
                'id': s['id'],
                'categoryId': s['categoryId'],
                'en': s['en'],
                'pronunciationSi': s['pronunciationSi'],
                'meaningSi': s['meaningSi'],
                'level': s['level']
            }
            for s in final_sentences
        ]
        json.dump(clean_json_list, f, ensure_ascii=False, indent=2)

    # 3. Export to CSV
    print(f'Exporting to CSV: {CSV_PATH}')
    with open(CSV_PATH, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['id', 'category_id', 'en', 'pronunciation_si', 'meaning_si', 'level'])
        for s in final_sentences:
            writer.writerow([s['id'], s['categoryId'], s['en'], s['pronunciationSi'], s['meaningSi'], s['level']])

    # 4. Update assets/content/content.json
    print(f'Updating bundle: {CONTENT_JSON_PATH}')
    with open(CONTENT_JSON_PATH, 'r', encoding='utf-8') as f:
        content_data = json.load(f)

    # Merge/replace sentences in content.json
    content_data['sentences'] = clean_json_list
    content_data['version'] = content_data.get('version', 1) + 1

    with open(CONTENT_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(content_data, f, ensure_ascii=False, indent=2)

    print('Processing successfully completed!')

if __name__ == '__main__':
    main()
