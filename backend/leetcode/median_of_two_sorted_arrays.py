def find_median_sorted_arrays(nums1, nums2):
    # Combine the two arrays
    merged = sorted(nums1 + nums2)
    length = len(merged)
    # Find the median
    if length % 2 == 0:
        median = (merged[length // 2 - 1] + merged[length // 2]) / 2
    else:
        median = merged[length // 2]
    return median

# Example usage:
if __name__ == '__main__':
    nums1 = [1, 3]
    nums2 = [2]
    print(find_median_sorted_arrays(nums1, nums2))  # Output should be 2.0
    
    nums1 = [1, 2]
    nums2 = [3, 4]
    print(find_median_sorted_arrays(nums1, nums2))  # Output should be 2.5
