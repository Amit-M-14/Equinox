def two_sum(nums, target):
    num_map = {}
    for index, number in enumerate(nums):
        difference = target - number
        if difference in num_map:
            return [num_map[difference], index]
        num_map[number] = index
    return []

# Example usage
if __name__ == '__main__':
    nums = [2, 7, 11, 15]
    target = 9
    result = two_sum(nums, target)
    print(result)  # Output: [0, 1]