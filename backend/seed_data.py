"""
Seed script: populates the SQLite DB with ~100 curated LeetCode problems
with company tags, topics, and difficulty levels.
Run: python seed_data.py (from backend/ directory)
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal
from app import models

models.Base.metadata.create_all(bind=engine)

PROBLEMS = [
    # ── ARRAY ──────────────────────────────────────────────────────────────
    {"title":"Two Sum","title_slug":"two-sum","difficulty":"Easy","topic":"array","companies":["Google","Amazon","Microsoft","Meta"],"acceptance_rate":49.1,"description":"Find two numbers that add up to target."},
    {"title":"Best Time to Buy and Sell Stock","title_slug":"best-time-to-buy-and-sell-stock","difficulty":"Easy","topic":"array","companies":["Amazon","Google","Meta"],"acceptance_rate":54.2,"description":"Maximize profit from stock prices."},
    {"title":"Contains Duplicate","title_slug":"contains-duplicate","difficulty":"Easy","topic":"array","companies":["Amazon","Microsoft"],"acceptance_rate":61.3,"description":"Check if array has duplicates."},
    {"title":"Maximum Subarray","title_slug":"maximum-subarray","difficulty":"Medium","topic":"array","companies":["Amazon","Microsoft","Google"],"acceptance_rate":50.4,"description":"Kadane's algorithm for max subarray sum."},
    {"title":"Product of Array Except Self","title_slug":"product-of-array-except-self","difficulty":"Medium","topic":"array","companies":["Amazon","Google","Meta","Microsoft"],"acceptance_rate":65.1,"description":"Return products excluding self without division."},
    {"title":"3Sum","title_slug":"3sum","difficulty":"Medium","topic":"array","companies":["Amazon","Google","Meta","Microsoft"],"acceptance_rate":32.7,"description":"Find all triplets summing to zero."},
    {"title":"Container With Most Water","title_slug":"container-with-most-water","difficulty":"Medium","topic":"array","companies":["Google","Amazon","Meta"],"acceptance_rate":54.5,"description":"Two pointers to maximize water container area."},
    {"title":"Trapping Rain Water","title_slug":"trapping-rain-water","difficulty":"Hard","topic":"array","companies":["Google","Amazon","Microsoft","Meta"],"acceptance_rate":60.3,"description":"Calculate trapped water between bars."},
    {"title":"Merge Intervals","title_slug":"merge-intervals","difficulty":"Medium","topic":"array","companies":["Google","Amazon","Microsoft","Meta"],"acceptance_rate":46.9,"description":"Merge overlapping intervals."},
    {"title":"Find Minimum in Rotated Sorted Array","title_slug":"find-minimum-in-rotated-sorted-array","difficulty":"Medium","topic":"array","companies":["Amazon","Microsoft","Google"],"acceptance_rate":49.8,"description":"Binary search in rotated array."},

    # ── STRING ─────────────────────────────────────────────────────────────
    {"title":"Valid Anagram","title_slug":"valid-anagram","difficulty":"Easy","topic":"string","companies":["Amazon","Google","Microsoft"],"acceptance_rate":63.4,"description":"Check if two strings are anagrams."},
    {"title":"Valid Palindrome","title_slug":"valid-palindrome","difficulty":"Easy","topic":"string","companies":["Meta","Amazon","Microsoft"],"acceptance_rate":45.2,"description":"Check if string is a palindrome."},
    {"title":"Longest Substring Without Repeating Characters","title_slug":"longest-substring-without-repeating-characters","difficulty":"Medium","topic":"string","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":34.2,"description":"Sliding window for unique characters."},
    {"title":"Group Anagrams","title_slug":"group-anagrams","difficulty":"Medium","topic":"string","companies":["Amazon","Google","Meta"],"acceptance_rate":67.8,"description":"Group strings that are anagrams of each other."},
    {"title":"Longest Palindromic Substring","title_slug":"longest-palindromic-substring","difficulty":"Medium","topic":"string","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":33.5,"description":"Expand around center to find longest palindrome."},
    {"title":"Minimum Window Substring","title_slug":"minimum-window-substring","difficulty":"Hard","topic":"string","companies":["Amazon","Google","Meta","Microsoft"],"acceptance_rate":40.8,"description":"Sliding window to find minimum covering substring."},
    {"title":"Encode and Decode Strings","title_slug":"encode-and-decode-strings","difficulty":"Medium","topic":"string","companies":["Google","Amazon"],"acceptance_rate":40.1,"description":"Design encode/decode without delimiters."},
    {"title":"Palindromic Substrings","title_slug":"palindromic-substrings","difficulty":"Medium","topic":"string","companies":["Amazon","Microsoft"],"acceptance_rate":68.2,"description":"Count palindromic substrings."},

    # ── LINKED LIST ────────────────────────────────────────────────────────
    {"title":"Reverse Linked List","title_slug":"reverse-linked-list","difficulty":"Easy","topic":"linked-list","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":74.6,"description":"Iteratively or recursively reverse a linked list."},
    {"title":"Merge Two Sorted Lists","title_slug":"merge-two-sorted-lists","difficulty":"Easy","topic":"linked-list","companies":["Amazon","Microsoft","Google"],"acceptance_rate":63.7,"description":"Merge two sorted linked lists."},
    {"title":"Linked List Cycle","title_slug":"linked-list-cycle","difficulty":"Easy","topic":"linked-list","companies":["Amazon","Microsoft","Meta"],"acceptance_rate":50.1,"description":"Detect cycle using Floyd's algorithm."},
    {"title":"Remove Nth Node From End of List","title_slug":"remove-nth-node-from-end-of-list","difficulty":"Medium","topic":"linked-list","companies":["Amazon","Google","Microsoft"],"acceptance_rate":43.1,"description":"Two pointers to remove nth from end."},
    {"title":"Reorder List","title_slug":"reorder-list","difficulty":"Medium","topic":"linked-list","companies":["Amazon","Google"],"acceptance_rate":58.4,"description":"Reorder list to L0→Ln→L1→Ln-1."},
    {"title":"Merge K Sorted Lists","title_slug":"merge-k-sorted-lists","difficulty":"Hard","topic":"linked-list","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":51.5,"description":"Merge K sorted lists using a heap."},
    {"title":"LRU Cache","title_slug":"lru-cache","difficulty":"Medium","topic":"linked-list","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":43.4,"description":"Design LRU cache with O(1) ops."},

    # ── TREE ───────────────────────────────────────────────────────────────
    {"title":"Invert Binary Tree","title_slug":"invert-binary-tree","difficulty":"Easy","topic":"tree","companies":["Google","Amazon","Microsoft"],"acceptance_rate":76.9,"description":"Recursively invert a binary tree."},
    {"title":"Maximum Depth of Binary Tree","title_slug":"maximum-depth-of-binary-tree","difficulty":"Easy","topic":"tree","companies":["Amazon","Microsoft","Google"],"acceptance_rate":74.7,"description":"DFS to find max depth."},
    {"title":"Same Tree","title_slug":"same-tree","difficulty":"Easy","topic":"tree","companies":["Amazon","Microsoft"],"acceptance_rate":59.8,"description":"Check structural equality of two trees."},
    {"title":"Binary Tree Level Order Traversal","title_slug":"binary-tree-level-order-traversal","difficulty":"Medium","topic":"tree","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":67.2,"description":"BFS level-by-level traversal."},
    {"title":"Validate Binary Search Tree","title_slug":"validate-binary-search-tree","difficulty":"Medium","topic":"tree","companies":["Amazon","Google","Microsoft"],"acceptance_rate":33.2,"description":"Validate BST property with bounds."},
    {"title":"Lowest Common Ancestor of a BST","title_slug":"lowest-common-ancestor-of-a-binary-search-tree","difficulty":"Medium","topic":"tree","companies":["Amazon","Google","Meta","Microsoft"],"acceptance_rate":65.1,"description":"Find LCA using BST property."},
    {"title":"Binary Tree Maximum Path Sum","title_slug":"binary-tree-maximum-path-sum","difficulty":"Hard","topic":"tree","companies":["Amazon","Google","Meta","Microsoft"],"acceptance_rate":38.9,"description":"DFS to find max path sum through any nodes."},
    {"title":"Construct Binary Tree from Preorder and Inorder","title_slug":"construct-binary-tree-from-preorder-and-inorder-traversal","difficulty":"Medium","topic":"tree","companies":["Amazon","Google"],"acceptance_rate":62.3,"description":"Rebuild tree from traversal arrays."},
    {"title":"Kth Smallest Element in a BST","title_slug":"kth-smallest-element-in-a-bst","difficulty":"Medium","topic":"tree","companies":["Amazon","Google","Microsoft"],"acceptance_rate":72.4,"description":"In-order traversal to find kth smallest."},
    {"title":"Serialize and Deserialize Binary Tree","title_slug":"serialize-and-deserialize-binary-tree","difficulty":"Hard","topic":"tree","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":56.8,"description":"BFS-based tree serialization."},

    # ── GRAPH ──────────────────────────────────────────────────────────────
    {"title":"Number of Islands","title_slug":"number-of-islands","difficulty":"Medium","topic":"graph","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":57.5,"description":"DFS/BFS to count disconnected land masses."},
    {"title":"Clone Graph","title_slug":"clone-graph","difficulty":"Medium","topic":"graph","companies":["Amazon","Google","Meta"],"acceptance_rate":55.1,"description":"Deep copy of a graph using BFS."},
    {"title":"Course Schedule","title_slug":"course-schedule","difficulty":"Medium","topic":"graph","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":46.1,"description":"Topological sort / cycle detection."},
    {"title":"Pacific Atlantic Water Flow","title_slug":"pacific-atlantic-water-flow","difficulty":"Medium","topic":"graph","companies":["Google","Amazon"],"acceptance_rate":54.1,"description":"Multi-source BFS from both oceans."},
    {"title":"Word Ladder","title_slug":"word-ladder","difficulty":"Hard","topic":"graph","companies":["Amazon","Google","Microsoft"],"acceptance_rate":36.7,"description":"BFS shortest transformation sequence."},
    {"title":"Graph Valid Tree","title_slug":"graph-valid-tree","difficulty":"Medium","topic":"graph","companies":["Google","Amazon","Microsoft"],"acceptance_rate":46.3,"description":"Union-Find or DFS for valid tree check."},
    {"title":"Alien Dictionary","title_slug":"alien-dictionary","difficulty":"Hard","topic":"graph","companies":["Google","Amazon","Meta","Microsoft"],"acceptance_rate":34.1,"description":"Topological sort from alien language."},
    {"title":"Rotting Oranges","title_slug":"rotting-oranges","difficulty":"Medium","topic":"graph","companies":["Amazon","Google","Meta"],"acceptance_rate":53.2,"description":"Multi-source BFS for time to rot all oranges."},

    # ── DYNAMIC PROGRAMMING ────────────────────────────────────────────────
    {"title":"Climbing Stairs","title_slug":"climbing-stairs","difficulty":"Easy","topic":"dynamic-programming","companies":["Amazon","Google","Microsoft"],"acceptance_rate":51.9,"description":"Fibonacci-based DP for stair climbing."},
    {"title":"House Robber","title_slug":"house-robber","difficulty":"Medium","topic":"dynamic-programming","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":50.2,"description":"1D DP to maximize non-adjacent house robbery."},
    {"title":"Coin Change","title_slug":"coin-change","difficulty":"Medium","topic":"dynamic-programming","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":41.8,"description":"BFS/DP to find minimum coins for amount."},
    {"title":"Longest Increasing Subsequence","title_slug":"longest-increasing-subsequence","difficulty":"Medium","topic":"dynamic-programming","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":52.9,"description":"DP/Binary search for LIS."},
    {"title":"Word Break","title_slug":"word-break","difficulty":"Medium","topic":"dynamic-programming","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":45.5,"description":"DP with dictionary lookup."},
    {"title":"Unique Paths","title_slug":"unique-paths","difficulty":"Medium","topic":"dynamic-programming","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":63.8,"description":"2D grid DP for unique paths."},
    {"title":"Jump Game","title_slug":"jump-game","difficulty":"Medium","topic":"dynamic-programming","companies":["Amazon","Google","Microsoft"],"acceptance_rate":38.5,"description":"Greedy/DP to check reachability."},
    {"title":"Partition Equal Subset Sum","title_slug":"partition-equal-subset-sum","difficulty":"Medium","topic":"dynamic-programming","companies":["Amazon","Google","Microsoft"],"acceptance_rate":46.3,"description":"0/1 Knapsack variant."},
    {"title":"Edit Distance","title_slug":"edit-distance","difficulty":"Hard","topic":"dynamic-programming","companies":["Google","Amazon","Microsoft","Meta"],"acceptance_rate":56.1,"description":"2D DP for min edit operations."},
    {"title":"Burst Balloons","title_slug":"burst-balloons","difficulty":"Hard","topic":"dynamic-programming","companies":["Google","Amazon"],"acceptance_rate":57.2,"description":"Interval DP with reverse thinking."},
    {"title":"Regular Expression Matching","title_slug":"regular-expression-matching","difficulty":"Hard","topic":"dynamic-programming","companies":["Google","Amazon","Meta"],"acceptance_rate":28.6,"description":"2D DP for regex pattern matching."},

    # ── GREEDY ─────────────────────────────────────────────────────────────
    {"title":"Jump Game II","title_slug":"jump-game-ii","difficulty":"Medium","topic":"greedy","companies":["Amazon","Google","Meta"],"acceptance_rate":39.6,"description":"Greedy BFS to find min jumps."},
    {"title":"Gas Station","title_slug":"gas-station","difficulty":"Medium","topic":"greedy","companies":["Amazon","Google","Microsoft"],"acceptance_rate":45.2,"description":"Greedy circular route feasibility."},
    {"title":"Task Scheduler","title_slug":"task-scheduler","difficulty":"Medium","topic":"greedy","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":58.1,"description":"Greedy/heap task scheduling with cooldown."},
    {"title":"Minimum Number of Arrows to Burst Balloons","title_slug":"minimum-number-of-arrows-to-burst-balloons","difficulty":"Medium","topic":"greedy","companies":["Google","Amazon"],"acceptance_rate":57.3,"description":"Interval greedy for arrow minimization."},
    {"title":"Non-overlapping Intervals","title_slug":"non-overlapping-intervals","difficulty":"Medium","topic":"greedy","companies":["Google","Amazon","Microsoft"],"acceptance_rate":51.0,"description":"Greedy interval scheduling."},

    # ── BACKTRACKING ───────────────────────────────────────────────────────
    {"title":"Subsets","title_slug":"subsets","difficulty":"Medium","topic":"backtracking","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":76.3,"description":"Generate all subsets via backtracking."},
    {"title":"Permutations","title_slug":"permutations","difficulty":"Medium","topic":"backtracking","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":76.8,"description":"Generate all permutations."},
    {"title":"Combination Sum","title_slug":"combination-sum","difficulty":"Medium","topic":"backtracking","companies":["Amazon","Google","Microsoft"],"acceptance_rate":69.0,"description":"Find all combinations summing to target."},
    {"title":"Word Search","title_slug":"word-search","difficulty":"Medium","topic":"backtracking","companies":["Amazon","Microsoft","Meta"],"acceptance_rate":40.5,"description":"DFS backtracking on grid for word."},
    {"title":"N-Queens","title_slug":"n-queens","difficulty":"Hard","topic":"backtracking","companies":["Amazon","Google","Microsoft"],"acceptance_rate":65.1,"description":"Place N queens with no attacks."},
    {"title":"Sudoku Solver","title_slug":"sudoku-solver","difficulty":"Hard","topic":"backtracking","companies":["Amazon","Google","Microsoft"],"acceptance_rate":59.3,"description":"Backtracking to solve 9x9 Sudoku."},

    # ── HEAP ───────────────────────────────────────────────────────────────
    {"title":"Kth Largest Element in an Array","title_slug":"kth-largest-element-in-an-array","difficulty":"Medium","topic":"heap-priority-queue","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":67.2,"description":"Min-heap or quickselect for kth largest."},
    {"title":"Find Median from Data Stream","title_slug":"find-median-from-data-stream","difficulty":"Hard","topic":"heap-priority-queue","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":51.7,"description":"Two-heap approach for streaming median."},
    {"title":"Top K Frequent Elements","title_slug":"top-k-frequent-elements","difficulty":"Medium","topic":"heap-priority-queue","companies":["Amazon","Google","Meta","Microsoft"],"acceptance_rate":65.2,"description":"Max-heap or bucket sort for top K."},
    {"title":"Ugly Number II","title_slug":"ugly-number-ii","difficulty":"Medium","topic":"heap-priority-queue","companies":["Google","Amazon"],"acceptance_rate":45.5,"description":"Min-heap to generate ugly numbers in order."},

    # ── STACK ──────────────────────────────────────────────────────────────
    {"title":"Valid Parentheses","title_slug":"valid-parentheses","difficulty":"Easy","topic":"stack","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":40.5,"description":"Stack-based bracket matching."},
    {"title":"Min Stack","title_slug":"min-stack","difficulty":"Medium","topic":"stack","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":53.8,"description":"Design stack with O(1) min retrieval."},
    {"title":"Daily Temperatures","title_slug":"daily-temperatures","difficulty":"Medium","topic":"stack","companies":["Amazon","Google","Meta"],"acceptance_rate":66.5,"description":"Monotonic stack for next warmer day."},
    {"title":"Largest Rectangle in Histogram","title_slug":"largest-rectangle-in-histogram","difficulty":"Hard","topic":"stack","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":43.7,"description":"Monotonic stack for max rectangle area."},
    {"title":"Evaluate Reverse Polish Notation","title_slug":"evaluate-reverse-polish-notation","difficulty":"Medium","topic":"stack","companies":["Amazon","Google","Microsoft"],"acceptance_rate":47.9,"description":"Stack-based RPN evaluation."},

    # ── BINARY SEARCH ──────────────────────────────────────────────────────
    {"title":"Binary Search","title_slug":"binary-search","difficulty":"Easy","topic":"binary-search","companies":["Amazon","Google","Microsoft"],"acceptance_rate":56.5,"description":"Classic binary search on sorted array."},
    {"title":"Search in Rotated Sorted Array","title_slug":"search-in-rotated-sorted-array","difficulty":"Medium","topic":"binary-search","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":39.7,"description":"Modified binary search for rotated array."},
    {"title":"Time Based Key-Value Store","title_slug":"time-based-key-value-store","difficulty":"Medium","topic":"binary-search","companies":["Google","Amazon","Meta"],"acceptance_rate":54.3,"description":"Binary search on timestamps."},
    {"title":"Koko Eating Bananas","title_slug":"koko-eating-bananas","difficulty":"Medium","topic":"binary-search","companies":["Amazon","Google"],"acceptance_rate":48.9,"description":"Binary search on answer space."},

    # ── TWO POINTERS ───────────────────────────────────────────────────────
    {"title":"Valid Palindrome II","title_slug":"valid-palindrome-ii","difficulty":"Easy","topic":"two-pointers","companies":["Meta","Amazon","Google"],"acceptance_rate":39.8,"description":"Two pointers with one deletion allowed."},
    {"title":"Two Sum II","title_slug":"two-sum-ii-input-array-is-sorted","difficulty":"Medium","topic":"two-pointers","companies":["Amazon","Google","Microsoft"],"acceptance_rate":60.6,"description":"Two pointers on sorted array."},
    {"title":"Squares of a Sorted Array","title_slug":"squares-of-a-sorted-array","difficulty":"Easy","topic":"two-pointers","companies":["Amazon","Google"],"acceptance_rate":72.1,"description":"Two pointers to merge squared arrays."},

    # ── SLIDING WINDOW ─────────────────────────────────────────────────────
    {"title":"Sliding Window Maximum","title_slug":"sliding-window-maximum","difficulty":"Hard","topic":"sliding-window","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":46.5,"description":"Deque-based sliding window max."},
    {"title":"Permutation in String","title_slug":"permutation-in-string","difficulty":"Medium","topic":"sliding-window","companies":["Amazon","Google","Microsoft"],"acceptance_rate":44.5,"description":"Fixed-window anagram check."},
    {"title":"Longest Repeating Character Replacement","title_slug":"longest-repeating-character-replacement","difficulty":"Medium","topic":"sliding-window","companies":["Amazon","Google","Meta"],"acceptance_rate":51.7,"description":"Sliding window with character frequency."},

    # ── DFS/BFS ────────────────────────────────────────────────────────────
    {"title":"Walls and Gates","title_slug":"walls-and-gates","difficulty":"Medium","topic":"breadth-first-search","companies":["Google","Amazon","Meta"],"acceptance_rate":64.5,"description":"Multi-source BFS from gates."},
    {"title":"Surrounded Regions","title_slug":"surrounded-regions","difficulty":"Medium","topic":"depth-first-search","companies":["Google","Amazon","Microsoft"],"acceptance_rate":36.2,"description":"DFS from border 'O' cells outward."},
    {"title":"Max Area of Island","title_slug":"max-area-of-island","difficulty":"Medium","topic":"depth-first-search","companies":["Amazon","Google","Microsoft"],"acceptance_rate":70.9,"description":"DFS to find largest island."},

    # ── HASH TABLE ─────────────────────────────────────────────────────────
    {"title":"Ransom Note","title_slug":"ransom-note","difficulty":"Easy","topic":"hash-table","companies":["Amazon","Google","Microsoft"],"acceptance_rate":59.7,"description":"Character frequency matching."},
    {"title":"Isomorphic Strings","title_slug":"isomorphic-strings","difficulty":"Easy","topic":"hash-table","companies":["Amazon","Google","Microsoft"],"acceptance_rate":43.7,"description":"Bidirectional character mapping."},
    {"title":"Happy Number","title_slug":"happy-number","difficulty":"Easy","topic":"hash-table","companies":["Amazon","Google","Microsoft"],"acceptance_rate":55.6,"description":"Cycle detection with hash set."},
    {"title":"Longest Consecutive Sequence","title_slug":"longest-consecutive-sequence","difficulty":"Medium","topic":"hash-table","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":44.2,"description":"HashSet O(n) consecutive sequence."},

    # ── SORTING ────────────────────────────────────────────────────────────
    {"title":"Sort Colors","title_slug":"sort-colors","difficulty":"Medium","topic":"sorting","companies":["Amazon","Google","Microsoft"],"acceptance_rate":60.4,"description":"Dutch national flag three-way partition."},
    {"title":"Meeting Rooms II","title_slug":"meeting-rooms-ii","difficulty":"Medium","topic":"sorting","companies":["Amazon","Google","Microsoft","Meta"],"acceptance_rate":50.3,"description":"Min-heap for overlapping meeting count."},
    {"title":"Largest Number","title_slug":"largest-number","difficulty":"Medium","topic":"sorting","companies":["Amazon","Google","Meta"],"acceptance_rate":35.1,"description":"Custom sort to form largest number."},
]


def seed():
    db = SessionLocal()
    try:
        existing = db.query(models.Problem).count()
        if existing >= len(PROBLEMS):
            print(f"[OK] Database already seeded with {existing} problems.")
            return

        for p in PROBLEMS:
            exists = db.query(models.Problem).filter(
                models.Problem.title_slug == p["title_slug"]
            ).first()
            if not exists:
                prob = models.Problem(
                    title=p["title"],
                    title_slug=p["title_slug"],
                    difficulty=p["difficulty"],
                    topic=p["topic"],
                    companies=p["companies"],
                    acceptance_rate=p.get("acceptance_rate"),
                    leetcode_url=f"https://leetcode.com/problems/{p['title_slug']}/",
                    description=p.get("description", ""),
                )
                db.add(prob)

        db.commit()
        final = db.query(models.Problem).count()
        print(f"[OK] Seeded {final} problems into the database.")
    except Exception as e:
        print(f"[ERROR] Error seeding: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
