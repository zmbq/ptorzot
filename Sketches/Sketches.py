import random
import itertools
import cPickle

def create_drill():
    def rand_number():
        return random.randint(1,6)

    target = rand_number() * 10 + rand_number()
    numbers = [rand_number() for i in range(5)]

    return (numbers, target)

class OpEnumerator(object):
    def __init__(self):
        self.all_ops = ('+', '-', '*', '/')
        self.non_associative_ops = ('-', '/')

        self.init_cache()

    def init_cache(self):
        file = None 
        try:
            print "Loading cache from ops.cache"
            file = open("ops.cache")
            self.cache = cPickle.load(file)
            print "Cache loaded"
        except Exception as e:
            print "Can't load cache: %s, calculating" % e.message
            self.calculate_cache()
        finally:
            if file:
                file.close()

    def calculate_cache(self):
        self.cache = {}
        for n in range(2,6):
            print ("Calculating operations for %d elements..." % n), 
            self.cache[n] = set(self.iter_n_operations(n))
            print "%d operations" % len(self.cache[n])

        file = None
        try:
            print "Storing cache in ops.cache"
            file = open("ops.cache", "w")
            cPickle.dump(self.cache, file)
        except Exception as e:
            print "Can't store cache: %s" % e.message
        finally:
            file.close()

    def get_iters(self, n):
        if self.cache.has_key(n):
            return self.cache[n]
        return self.iter_n_operations(n)

    def get_ops(self,pair):
        # return all_ops
        if pair[0] < pair[1]:
            return self.all_ops
        else:
            return self.non_associative_ops

    def iter_n_operations(self, n):
        if n<2:
            return;
        elif n==2:
            for p in [(0,1), (1,0)]:
                for o in self.get_ops(p):
                    yield ((p,o),)
        else:
            for p in itertools.combinations(range(n), 2):
                for p2 in ((p[0], p[1]), (p[1], p[0])):
                     for o in self.get_ops(p2):
                         for rest in self.iter_n_operations(n-1):
                             yield ((p2,o),) + rest

class Solver(object):
    def __init__(self):
        self.enum = OpEnumerator()

    def apply_op(self, numbers, pair, op):
        def calc_op(a, b, op):
            if op=='+':
                return a+b
            elif op=='-':
                return a-b
            elif op=='*':
                return a*b
            elif op=='/':
                if b==0:
                    return -1
                else:
                    return a/b

        return calc_op(numbers[pair[0]], numbers[pair[1]], op)

    def apply_ops(self, numbers, ops):
        pad = numbers[:]
        for op in ops:
            pair = op[0]
            operation = op[1]
            result = self.apply_op(pad, pair, operation)
            pad[pair[0]] = result
            pad.pop(pair[1])
        return pad[0]

    def find_result(self, numbers, target):
        pad = [float(n) for n in numbers]

        for ops in self.enum.get_iters(len(numbers)):
            result = self.apply_ops(pad, ops)
            if result==target:
                return ops
        return None

def display_ops(numbers, ops):
    pad = [int(n) for n in numbers]
    print pad
    for op in ops:
        pair = op[0]
        operation = op[1]
        s = "(%s %s %s)" % (str(pad[pair[0]]), operation, (str(pad[pair[1]])))
        pad[pair[0]] = s
        pad.pop(pair[1])
        print pad
    return pad[0]

def solve_drill(numbers, target, solver=None):
    print "Reach %d from %s" % (target, str(numbers))
    if not solver:
        solver = Solver()

    result = solver.find_result(numbers, target)
    print "Raw result: ", result
    if result:
        print "%s = %d" % (display_ops(numbers, result), target)
    else:
        print "No result"

def solve():
    solver = Solver()
    solve_drill([1,1,1,1,1], 99)

if __name__=='__main__':
    solve()

