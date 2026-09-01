const fs = require('fs');

function recover_rule(code, ruleId) {
    let prefix = "";
    if (ruleId === 1) prefix = "${siteSettings?.currency || '";
    if (ruleId === 2) prefix = ">{siteSettings?.currency || '";
    if (ruleId === 3) prefix = ">{siteSettings?.currency || '";
    if (ruleId === 4) prefix = "{siteSettings?.currency || '";
    
    // Find the first occurrence of prefix
    let idx = code.indexOf(prefix);
    if (idx === -1) return code; // Rule did not match / corrupt
    
    let A = code.substring(0, idx);
    
    // The injection is `prefix + REST_OF_ORIGINAL + suffix`
    // Wait, the injection is immediately followed by the NEXT match's injection, or if it's the last match, just `suffix` and then the rest of the original string (which is nothing).
    // Actually, look at the output of print_rules:
    // Rule 4: A {siteSettings?.currency || ' B $20.00 C}10.00 B {siteSettings?.currency || ' C}20.00 C
    // A = `A `
    // prefix = `{siteSettings?.currency || '`
    // REST_OF_ORIGINAL = ` B $20.00 C`
    // suffix = `}10.00`
    // What follows suffix? ` B {siteSettings?.currency || ' C}20.00 C`
    
    // Notice that `REST_OF_ORIGINAL` is EXACTLY the string from right after `prefix` up to `suffix`.
    // But how do we find `suffix`? 
    // We know the length of `REST_OF_ORIGINAL`!
    // How? We don't! But we know that the string after `suffix` is the CORRUPTED version of `REST_OF_ORIGINAL`!
    // Wait! Let L = length of `REST_OF_ORIGINAL`.
    // The string after `prefix` is `REST_OF_ORIGINAL` followed by `suffix`.
    // Since `REST_OF_ORIGINAL` contains NO corrupted parts from THIS rule, its length is much shorter than the remaining string.
    // We can just find the correct `L` by brute force!
    // For a guessed `L`, `REST_OF_ORIGINAL` = code.substring(idx + prefix.length, idx + prefix.length + L).
    // Then `suffix` starts at `idx + prefix.length + L`.
    // We can check if `suffix` matches the expected format for this rule!
    // For Rule 4, suffix is `}XX.XX`.
    // For Rule 3, suffix is `}{`.
    // For Rule 2, suffix is `}XX.XX<`.
    // For Rule 1, suffix is `}${`.
    
    // Let's implement this!
    for (let L = 1; L < code.length - idx - prefix.length; L++) {
        let rest_orig = code.substring(idx + prefix.length, idx + prefix.length + L);
        let suffix_and_beyond = code.substring(idx + prefix.length + L);
        
        let original_match = "";
        let suffix_len = 0;
        
        if (ruleId === 1) {
            if (suffix_and_beyond.startsWith("}${")) {
                original_match = "$${";
                suffix_len = 3;
            }
        } else if (ruleId === 2) {
            let m = suffix_and_beyond.match(/^}([0-9]+\.[0-9]+)</);
            if (m) {
                original_match = ">$" + m[1] + "<";
                suffix_len = m[0].length;
            }
        } else if (ruleId === 3) {
            if (suffix_and_beyond.startsWith("}{")) {
                original_match = ">${";
                suffix_len = 2;
            }
        } else if (ruleId === 4) {
            let m = suffix_and_beyond.match(/^}([0-9]+\.[0-9]{2})/);
            if (m) {
                original_match = "$" + m[1];
                suffix_len = m[0].length;
            }
        }
        
        if (suffix_len > 0) {
            // We found a VALID suffix!
            // But wait, what if there are multiple matches? We need to verify that `rest_orig` is EXACTLY the correct original string.
            // How? By running the replace rule on `A + original_match + rest_orig` and checking if it EQUALS `code`!
            let candidate_original = A + original_match + rest_orig;
            
            let regex;
            let replaceStr = "";
            if (ruleId === 1) { regex = /\$\$\{/g; replaceStr = "${siteSettings?.currency || '$'}${"; }
            if (ruleId === 2) { regex = />\$([0-9]+\.[0-9]+)</g; replaceStr = ">{siteSettings?.currency || '$'}$1<"; }
            if (ruleId === 3) { regex = />\$\{/g; replaceStr = ">{siteSettings?.currency || '$'}{"; }
            if (ruleId === 4) { regex = /\$([0-9]+\.[0-9]{2})/g; replaceStr = "{siteSettings?.currency || '$'}$1"; }
            
            let corrupted_candidate = candidate_original.replace(regex, replaceStr);
            if (corrupted_candidate === code) {
                return candidate_original;
            }
        }
    }
    
    return code; // Fallback
}

function full_recover(code) {
    let c = code;
    // Reverse in exact opposite order of application
    c = recover_rule(c, 4);
    c = recover_rule(c, 3);
    c = recover_rule(c, 2);
    c = recover_rule(c, 1);
    return c;
}

const glob = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { results = results.concat(walk(file)); } 
    else { if (file.endsWith('.tsx')) results.push(file); }
  });
  return results;
}

const files = walk('src');
let recovered_count = 0;

files.forEach(file => {
    let c = fs.readFileSync(file, 'utf8');
    if (c.includes("siteSettings?.currency || '")) {
        let orig = full_recover(c);
        if (orig !== c && !orig.includes("siteSettings?.currency || '")) {
            console.log("Successfully recovered: " + file);
            fs.writeFileSync(file, orig);
            recovered_count++;
        } else {
            console.log("Failed to fully recover: " + file);
        }
    }
});
console.log("Recovered files: " + recovered_count);
