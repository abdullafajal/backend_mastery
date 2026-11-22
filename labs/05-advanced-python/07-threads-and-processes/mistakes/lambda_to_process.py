"""A process can't receive a lambda: work is sent to another process by pickling it, and lambdas can't be pickled."""

from concurrent.futures import ProcessPoolExecutor

if __name__ == "__main__":
    with ProcessPoolExecutor() as pool:
        print(list(pool.map(lambda paise: paise // 100, [29900, 64900])))
