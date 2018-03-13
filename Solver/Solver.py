import web
import re
import simplejson
import random
import itertools
import cPickle
import urlparse
import os

class OpEnumerator(object):
    def __init__(self):
        self.all_ops = ('+', '-', '*', '/')
        self.non_associative_ops = ('-', '/')

        self.cache_path = os.path.dirname(os.path.abspath(__file__)) + "/ops.cache"
        self.init_cache()

    def init_cache(self):
        file = None 
        try:
            file = open(self.cache_path)
            self.cache = cPickle.load(file)
        except Exception as e:
            print "Can't load cache from %s: %s, calculating" % (self.cache_path, e)
            self.calculate_cache()
        finally:
            if file:
                file.close()

    def calculate_cache(self):
        self.cache = {}
        for n in range(2,6):
            self.cache[n] = set(self.iter_n_operations(n))

        file = None
        try:
            file = open(self.cache_path, "w")
            cPickle.dump(self.cache, file)
        except Exception as e:
            print "Can't store cache in %s: %s" % (self.cache_path, e)
        finally:
            if file:
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
            if abs(result-target) < 1e-4:   # These are floats, rounding errors may occur
                return ops
        return None

urls = ('/', 'SolverGate')

class OmniGate:
    def GET(self):
        return "OmniGate reached with URL " + web.ctx.homepath + " " + web.ctx.path

_solver = Solver()
_re_numbers = re.compile("numbers=(?P<numbers>(\d+,)*\d+)")
_re_target = re.compile("target=(?P<target>\d+)")

class SolverGate:
    def parse_params(self):
        query = web.ctx.query;
        params = {}
        try:
            params = urlparse.parse_qs(query[1:])
            target = int(params["target"][0])
            numbers  = [float(s) for s in params["numbers"][0].split(',')]
        except Exception as e:
            raise ValueError("Can't parse query string for target and numbers: %s" % e.message)
        return (numbers, target)

    def format_results(self, result):
        if result:
            return simplejson.dumps({"result": result})
        else:
            return "{}"

    def GET(self):
        try:
            (numbers, target) = self.parse_params()
            # Trying to solve the exercise
            result = _solver.find_result(numbers, target)
            web.header('Content-Type', 'application/json')
            return self.format_results(result)
        except ValueError as ve:
            web.ctx.status = 409
            return "Invalid query string: %s" % ve.message
        except Exception as e:
            web.ctx.status = 500
            return "Unexpected problem: %s" % e.message

application = web.application(urls, globals()).wsgifunc()

if __name__ == "__main__": 
    app = web.application(urls, globals())
    app.run()

